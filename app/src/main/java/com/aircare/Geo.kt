package com.aircare

import com.google.gson.Gson
import com.google.gson.annotations.SerializedName
import okhttp3.HttpUrl
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.IOException

object Geo {
    private val client = OkHttpClient()
    private val gson = Gson()

    fun reverseGeocode(lat: Double, lng: Double, apiKey: String, language: String = "ko"): String? {
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
                    geocodeResponse.results.first().formattedAddress
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
