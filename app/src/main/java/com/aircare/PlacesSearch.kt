package com.aircare

import android.app.Activity
import android.app.Application
import android.content.Intent
import androidx.activity.result.ActivityResultLauncher
import com.aircare.BuildConfig
import com.google.android.gms.maps.model.LatLng
import com.google.android.libraries.places.api.Places
import com.google.android.libraries.places.api.model.Place
import com.google.android.libraries.places.api.model.autocomplete.AutocompleteSessionToken
import com.google.android.libraries.places.widget.Autocomplete
import com.google.android.libraries.places.widget.model.AutocompleteActivityMode

object PlacesSearch {
    fun initialize(application: Application) {
        if (!Places.isInitialized()) {
            val apiKey = BuildConfig.GOOGLE_MAPS_API_KEY
            if (apiKey.isBlank()) {
                return
            }

            Places.initializeWithNewPlacesApiEnabled(
                application.applicationContext,
                apiKey
            )
        }
    }

    fun launchAutocomplete(activity: Activity, launcher: ActivityResultLauncher<Intent>) {
        val fields = listOf(
            Place.Field.ID,
            Place.Field.NAME,
            Place.Field.ADDRESS,
            Place.Field.LAT_LNG
        )
        val intent = Autocomplete.IntentBuilder(AutocompleteActivityMode.FULLSCREEN, fields)
            .setSessionToken(AutocompleteSessionToken.newInstance())
            .build(activity)
        launcher.launch(intent)
    }

    fun parseResult(data: Intent?): LatLng? {
        if (data == null) return null
        val place = Autocomplete.getPlaceFromIntent(data)
        return place.latLng
    }
}
