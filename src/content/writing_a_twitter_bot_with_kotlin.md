---
title: 'Kotlin Twitter-Telegram bot'
author: [Iury Souza]
tags: [kotlin, bot]
date: '2020-07-09T11:53:37.121Z'
image: img/twitter-telegram-header.jpeg
draft: false
---



Have you ever wondered how **Twitter bots** work?
Can we integrate them with **Telegram**?
Is it possible to do this **only** with **Kotlin**?

Fret not! Follow me while we uncover these mysteries!

### What we'll be creating

The idea here is pretty straight forward: 
A Twitter bot that downloads videos from tweets and sends them to me on Telegram.  

Whenever I reply to a post on Twitter that has a video, tagging the bot's username, the bot will download the video and send it to me on telegram. 
Simple enough, right?  You might have even seen something similar in the wild.

![Example of a similar bot in the wild](https://i.imgur.com/ov4jueb.png "@BaixaEssaPorra is a popular downloader bot in the brazilian twittersphere")

### Getting a little more technical

Now that we know what we want, how can we achieve this?

We'll have an application running locally on our machines that will somehow **listen to tweets that mention another user**.
After being notified of this event, we will need to **fetch the video URL** from the tweet we're replying to, **download the video** and finally **send it over to a telegram user** using the a bot.

After reading the [Twitter developer docs](https://developer.twitter.com/en/docs) I've found they offer 3 possibilities:

- [HTTP Polling](https://developer.twitter.com/en/docs/tweets/timelines/api-reference/get-statuses-mentions_timeline)
- [HTTP Streaming](https://developer.twitter.com/en/docs/tutorials/consuming-streaming-data#consuming-the-stream)
- [WebHooks](https://developer.twitter.com/en/docs/accounts-and-users/subscribe-account-activity/overview)

(If you're not familiar with these concepts you can check this [article](https://medium.com/@jeff.lee6268/getting-started-with-realtime-b5a8773deb1a) to understand the basics.)

### Choosing our tools

Now, since we're planning to use Kotlin to develop this, the first thing I did before diving-in was a little research (as usual). It seems we have some library options to make this task a little smoother.

Here's what I found:

- There's an unofficial Java library for the Twitter API called [Twitter4j](http://twitter4j.org/en/)
- There's a Java HTTP client for consuming Twitter's realtime streaming API called  [HBC](https://github.com/twitter/hbc)
- There's a wrapper for the Telegram bot API written in Kotlin called [kotlin-telegram-bot](https://github.com/kotlin-telegram-bot/kotlin-telegram-bot)

Sweet! The job just got a whole lot easier now that we don't need to build the HTTP clients for any of these.

The only issue is that we don't have any java/kotlin library to work with the `WebHooks` api, so we'll be using the ones above.


### Let's code!

First of all we need to get the keys to play with these services.

To get Twitter keys we'll need to create a Twitter App, you can get yours [here](https://developer.twitter.com/en/account/get-started) 
To get `Telegram`'s token is just as simple as talking to the [BotFather](https://web.telegram.org/#/im?p=@BotFather)

#### Hiding keys, tokens and secrets

First, we need a mechanism to load keys, secrets, userIds and tokens used in the project. It is a good practice to keep our keys out of version control.

To do that, we create a json file with all the keys and put it in the `resources` folder.

```json
{
  "consumerKey": "abc1234DEF1234GHI456",
  "consumerSecret": "abc1234DEF1234GHI456abc1234DEF1234GHI456",
  "token": "0123456789-abc1234DEF1234GHI456",
  "tokenSecret": "abc1234DEF1234GHI456abc1234DEF1234GHI456",
  "telegramToken": "0123456789:abc1234DEF1234GHI456-abc1234DEF1234GHI456",
  "twitterUserId": "012345678901234567890123456789",
  "telegramUserId": "01234567890123456789"
}
```



Then, we can use [Moshi](https://github.com/square/moshi) to simplify deserialization and the `AuthLoader` class to wrap it up.

Add this to your `gradle` file

```kotlin
implementation("com.squareup.moshi:moshi:1.9.3")
implementation("com.squareup.moshi:moshi-kotlin:1.9.3")
kapt("com.squareup.moshi:moshi-kotlin-codegen:1.9.3")
```
______
```kotlin
object MoshiWrapper {
    val instance: Moshi = Moshi.Builder()
        .add(KotlinJsonAdapterFactory())
        .build()

    inline fun <reified T : Any> fromJson(type: KClass<T>, json: String): T? {
        return instance.adapter(type.java).fromJson(json)
    }
}
```
______

```kotlin
@JsonClass(generateAdapter = true)
data class AuthData(
    val consumerKey: String,
    val consumerSecret: String,
    val token: String,
    val tokenSecret: String,
    val telegramToken: String,
    val twitterUserId: Long,
    val telegramUserId: Long
)
```
______

```kotlin
object AuthLoader {

    fun toOAuth(authData: AuthData): OAuth1 {
        val (consumerKey, consumerSecret, token, tokenSecret) = authData
        return OAuth1(consumerKey, consumerSecret, token, tokenSecret)
    }

    fun getAuthDataFrom(fileName: String): AuthData {
        val fileContent = getFileFromResources("/$fileName")
        return MoshiWrapper.fromJson(
            AuthData::class,
            fileContent
        )!!
    }

    private fun getFileFromResources(fileName: String): String {
        val resource = this::class.java.getResource(fileName)
        return if (resource == null) {
            throw IllegalArgumentException("file not found!")
        } else {
            File(resource.file).readText()
        }
    }
}
```



#### Filtering real time tweets

The [docs](https://developer.twitter.com/en/docs/tweets/filter-realtime/api-reference/post-statuses-filter) tell us that we can filter tweets using some parameters like `keywords` and `userIds`

In order to do that we can use the `HBC-core` and `HBC-Twitter4j` integration.

So, we'll be using a `Twitter4jStatusClient` to listen to filtered status updates. This class is a wrapper of HBC's  `BasicClient` . It is  responsible for opening the connection with the Streaming API and to pass filter parameters. The Integration with `Twitter4j` removes the need to model and deserialize the json responses when receiving status updates.



First we add the dependencies

```kotlin
implementation("com.twitter:hbc-core:2.2.0")
implementation("com.twitter:hbc-twitter4j:2.2.0")
implementation("org.twitter4j:twitter4j-core:4.0.7")
implementation("org.slf4j:slf4j-log4j12:1.6.0") //needed for twitter4j
implementation("io.github.kotlin-telegram-bot.kotlin-telegram-bot:telegram:5.0.0")
```

This is the implementation I came up to simplify consuming this stream:

```kotlin
class FilteredStatusStream(
    private val authData: AuthData,
    private val filterParams: FilterParams,
    private val statusListener: (Status) -> Unit
) {

    companion object {
        private const val CAPACITY = 1_000
        private const val THREAD_POOL_SIZE = 4
    }

    var statusClient: Twitter4jStatusClient? = null

    fun start() {
        val (followings, keywords) = filterParams

        val filters = createStatusFilters(followings, keywords)
        val msgQueue = LinkedBlockingQueue<String>(100 * CAPACITY)
        val client = createBasicClient(filters, msgQueue, CAPACITY)

        statusClient = createStatusClient(client, msgQueue, THREAD_POOL_SIZE).apply {
            connect()
            process()
        }
    }

    fun stop() {
        statusClient?.stop()
    }

    private fun createStatusFilters(followings: List<Long>, terms: List<String>) = StatusesFilterEndpoint().apply {
        followings(followings)
        trackTerms(terms)
    }

    private fun createStatusClient(
        client: BasicClient?,
        msgQueue: LinkedBlockingQueue<String>,
        poolSize: Int
    ) = Twitter4jStatusClient(
        client,
        msgQueue,
        listOf(DefaultStatusListener(statusListener)),
        Executors.newFixedThreadPool(poolSize)
    )

    private fun createBasicClient(
        endpoint: StatusesFilterEndpoint,
        msgQueue: LinkedBlockingQueue<String>,
        eventQueueSize: Int
    ) = ClientBuilder()
        .hosts(HttpHosts(Constants.STREAM_HOST))
        .authentication(AuthLoader.toOAuth(authData))
        .endpoint(endpoint)
        .processor(StringDelimitedProcessor(msgQueue))
        .eventMessageQueue(LinkedBlockingQueue(eventQueueSize))
        .build()
}
```



It looks like a lot, but it is really just configuration code. We're just hiding the complexity of setting up a Twitter steaming client.
Now we can listen to the tweets from the user with the `twitterUserId` whenever he mentions the tweeter handle `@MandaProZap` just by calling:

```kotlin
val authData = AuthLoader.getAuthDataFrom("auth_data.json")
val filterParams = FilterParams(listOf(authData.twitterUserId),listOf("@MandaProZap"))
    
FilteredStatusStream(authData, filterParams) { newStatus ->
        println(newStatus)
    }.start()
```

Awesome, right?!😁 

But... how do we get the video data?
First of all, just a quick recap: We want to get the video from the **tweet** that we're **replying** to.

This `newStatus` we're getting from the stream is our **own tweet**. So we still need to get the parent tweet and it's video.



#### Getting media from the parent tweet

Inspecting the `Status` returned from the stream we can see it's properties:

```java
private Date createdAt;
private long id;
private String text;
private int displayTextRangeStart = -1;
private int displayTextRangeEnd = -1;
private String source;
private boolean isTruncated;
private long inReplyToStatusId; //This is the one we need
.
..
...
```



Now we can use `Twitter4j` to fetch the parent tweet.

Again, we can simplify it's usage with this class:

```kotlin
class TwitterClient(authData: AuthData) {

    private val twitter: Twitter = TwitterFactory().instance

    init {
        twitter.setOAuthConsumer(authData.consumerKey, authData.consumerSecret)
        val accessToken = AccessToken(authData.token, authData.tokenSecret)
        twitter.oAuthAccessToken = accessToken
    }

    fun getStatusById(statusId: Long): Status? {
        return runCatching { twitter.showStatus(statusId) }.getOrNull()
    }
}
```



Finally we can get the video url like this:

```kotlin
val twitterClient = TwitterClient(authData)
twitterClient.getStatusById(newStatus.inReplyToStatusId)
            ?.mediaEntities
            ?.mapNotNull { it.videoVariants.firstOrNull()?.url }
            ?.forEach { url -> println(url)}
```

Almost there now! We just need to send the video to Telegram! But wait... if we send this url... we'll be sending just an url... not an actual video. We can do better!



**Downloading the video**

Since we're using the `kotlin-telegram-bot`, and it has transitive dependencies to [retrofit](https://github.com/square/retrofit) it seems like a good idea to using it to download the video file.

```kotlin
object FileDownloader {

    private val service = Retrofit
        .Builder()
        .baseUrl("http://localhost/")
        .build()
        .create(FileDownloadService::class.java)

    suspend fun downloadAndWriteToFile(url: String): File? = withContext(Dispatchers.IO) {
        val body = service.downloadFileFrom(url).await()
        writeToFile(body)
    }

    private fun writeToFile(responseBody: ResponseBody?): File? = runCatching {
        File("${System.currentTimeMillis()}.mp4").apply {
            createNewFile()
            Okio.buffer(Okio.sink(this)).write(responseBody!!.bytes()!!)
        }
    }.getOrNull()
}

interface FileDownloadService {
    @GET
    fun downloadFileFrom(@Url fileUrl: String): Call<ResponseBody?>
}
```

Here we're creating a  `FileDownloadService` with `Retrofit` and use it to download the url.

After that we write the data to a file using `Okio` (also comes bundled with retrofit).



You can see that we're using coroutines to switch threads while it still looks like synchronous code.

This was achieved with a simple extension function on `retrofit`'s  `Call`.

```kotlin
suspend fun <T> Call<T>.await(): T {
    return suspendCancellableCoroutine { continuation ->
        enqueue(object : Callback<T> {
            override fun onResponse(call: Call<T>, response: Response<T>) {
                if (response.isSuccessful && response.body() != null) {
                    continuation.resumeWith(Result.success(response.body()!!))
                } else {
                    continuation.resumeWithException(IOException(response.message()))
                }
            }

            override fun onFailure(call: Call<T>, t: Throwable) {
                continuation.resumeWithException(t)
            }
        })
    }
}
```

Ok, now we're downloading the video file. We just need to send it over to Telegram!



**Sending the video to Telegram**

This is the easiest part thanks to the amazing `kotlin-telegram-bot` library.

```kotlin
val telegramBot = bot { token = authData.telegramToken }
telegramBot.sendVideo(authData.telegramUserId, videoFile)
```



**Putting it all together**

```kotlin
fun main() {
    val authData = AuthLoader.getAuthDataFrom("auth_data.json")
    val filterParams = FilterParams(listOf(authData.twitterUserId),listOf("@MandaProZap"))

    val twitterClient = TwitterClient(authData)
    val telegramBot = bot { token = authData.telegramToken }

    FilteredStatusStream(authData, filterParams) { newStatus ->
        twitterClient.getStatusById(newStatus.inReplyToStatusId)
            ?.mediaEntities
            ?.mapNotNull { it.videoVariants.firstOrNull()?.url }
            ?.forEach { url ->
                GlobalScope.launch {
                    FileDownloader.downloadAndWriteToFile(url)?.let { videoFile ->
                        telegramBot.sendVideo(authData.telegramUserId, videoFile)
                    }
                }
            }
    }.start()
}
```



```kotlin
fun main() {
val authData = AuthLoader.getAuthDataFrom("auth_data.json")
val filterParams = FilterParams(listOf(authData.twitterUserId),listOf("@MandaProZap"))

    val twitterClient = TwitterClient(authData)
    val telegramBot = bot { token = authData.telegramToken }

    FilteredStatusStream(authData, filterParams) { newStatus ->
        twitterClient.getStatusById(newStatus.inReplyToStatusId)
            ?.mediaEntities
            ?.mapNotNull { it.videoVariants.firstOrNull()?.url }
            ?.forEach { url ->
                GlobalScope.launch {
                    FileDownloader.downloadAndWriteToFile(url)?.let { videoFile ->
                        telegramBot.sendVideo(authData.telegramUserId, videoFile)
                    }
                }
            }
    }.start()
}
```


### Summing it all up!

Yes, we can create a twitter-telegram bot with Kotlin while keeping it fairly simple.

Taking advantage of these libraries make the experience a lot smoother and adding some wrappers on top of it helps to hide the complexity and enable us to create a declarative API to let us focus on what matters.

The next step here is to implement this idea using the `WebHook API`, but this will have to be in a another post.

I hope you learned something along the way, I certainly did!

You can check the project on [github](https://github.com/iurysza/twitter-telegram-bot).
