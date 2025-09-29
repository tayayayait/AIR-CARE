package com.aircare

import com.google.gson.Gson
import com.google.gson.annotations.SerializedName
import okhttp3.HttpUrl
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.IOException
import java.util.Collections
import java.util.LinkedHashMap
import java.util.Locale

object Geo {
    private val client = OkHttpClient()
    private val gson = Gson()
    private val cache = Collections.synchronizedMap(
        object : LinkedHashMap<String, String>(50, 0.75f, true) {
            override fun removeEldestEntry(eldest: MutableMap.MutableEntry<String, String>): Boolean {
                return size > 100
            }
        }
    )

    fun reverseGeocode(lat: Double, lng: Double, apiKey: String, language: String = "ko"): String? {
        val cacheKey = String.format(Locale.US, "%.4f,%.4f", lat, lng)
        cache[cacheKey]?.let { return it }

        val url = HttpUrl.Builder()
            .scheme("https")
            .host("maps.googleapis.com")
            .addPathSegment("maps")
            .addPathSegment("api")
            .addPathSegment("geocode")
            .addPathSegment("json")
            .addQueryParameter("latlng", "$lat,$lng")
            .addQueryParameter("language", language)
            .addQueryParameter("key", apiKey)
            .build()

        val request = Request.Builder()
            .url(url)
            .get()
            .build()

        return try {
            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) {
                    return null
                }
                val body = response.body?.string() ?: return null
                val geocodeResponse = gson.fromJson(body, GeocodeResponse::class.java)
                if (geocodeResponse.status == "OK" && geocodeResponse.results.isNotEmpty()) {
                    geocodeResponse.results.first().formattedAddress.also { address ->
                        cache[cacheKey] = address
                    }
                } else {
                    null
                }
            }
        } catch (exception: IOException) {
            null
        }
    }

    private data class GeocodeResponse(
        @SerializedName("results") val results: List<GeocodeResult> = emptyList(),
        @SerializedName("status") val status: String = ""
    )

    private data class GeocodeResult(
        @SerializedName("formatted_address") val formattedAddress: String = ""
    )
}
