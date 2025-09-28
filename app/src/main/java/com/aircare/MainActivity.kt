package com.aircare

import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.TextView
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.TileOverlayOptions
import com.google.android.gms.maps.model.UrlTileProvider
import com.google.android.material.bottomsheet.BottomSheetBehavior
import com.google.android.material.button.MaterialButton
import com.google.android.material.card.MaterialCardView
import com.google.android.material.snackbar.Snackbar
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.net.MalformedURLException
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : AppCompatActivity(), OnMapReadyCallback, GoogleMap.OnCameraIdleListener {

    private var googleMap: GoogleMap? = null
    private lateinit var addressTextView: TextView
    private lateinit var coordinatesTextView: TextView
    private lateinit var updatedAtTextView: TextView
    private lateinit var bottomSheetBehavior: BottomSheetBehavior<MaterialCardView>

    private val locationPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
            if (isGranted) {
                enableMyLocation()
            } else {
                showPermissionDeniedMessage()
            }
        }

    private lateinit var autocompleteLauncher: ActivityResultLauncher<android.content.Intent>

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        PlacesSearch.initialize(application)

        addressTextView = findViewById(R.id.text_address)
        coordinatesTextView = findViewById(R.id.text_coordinates)
        updatedAtTextView = findViewById(R.id.text_updated_at)

        val bottomSheetCard: MaterialCardView = findViewById(R.id.bottom_sheet_container)
        bottomSheetBehavior = BottomSheetBehavior.from(bottomSheetCard)
        bottomSheetBehavior.state = BottomSheetBehavior.STATE_COLLAPSED

        val seoul = LatLng(37.5665, 126.9780)
        coordinatesTextView.text = String.format(
            Locale.KOREA,
            getString(R.string.coordinates_placeholder),
            seoul.latitude,
            seoul.longitude
        )
        updatedAtTextView.text = String.format(
            getString(R.string.updated_placeholder),
            SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.KOREA).format(Date())
        )

        autocompleteLauncher =
            registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
                if (result.resultCode == Activity.RESULT_OK) {
                    val place = PlacesSearch.parseResult(result.data)
                    place?.let { latLng ->
                        googleMap?.animateCamera(CameraUpdateFactory.newLatLngZoom(latLng, 13f))
                    }
                }
            }

        findViewById<MaterialButton>(R.id.button_search).setOnClickListener {
            PlacesSearch.launchAutocomplete(this, autocompleteLauncher)
        }

        val mapFragment = supportFragmentManager
            .findFragmentById(R.id.map_fragment) as SupportMapFragment
        mapFragment.getMapAsync(this)

        requestLocationPermission()
    }

    override fun onMapReady(map: GoogleMap) {
        googleMap = map
        val seoul = LatLng(37.5665, 126.9780)
        map.moveCamera(CameraUpdateFactory.newLatLngZoom(seoul, 11f))
        map.uiSettings.isMyLocationButtonEnabled = true
        map.uiSettings.isZoomControlsEnabled = true

        addHeatmapOverlay(map)

        map.setOnCameraIdleListener(this)
        enableMyLocation()
    }

    override fun onCameraIdle() {
        val map = googleMap ?: return
        val target = map.cameraPosition.target
        coordinatesTextView.text = String.format(
            Locale.KOREA,
            getString(R.string.coordinates_placeholder),
            target.latitude,
            target.longitude
        )
        updatedAtTextView.text = String.format(
            getString(R.string.updated_placeholder),
            SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.KOREA).format(Date())
        )

        lifecycleScope.launch(Dispatchers.IO) {
            val address = Geo.reverseGeocode(
                target.latitude,
                target.longitude,
                "YOUR_GOOGLE_MAPS_API_KEY"
            )
            withContext(Dispatchers.Main) {
                if (!isFinishing && !isDestroyed) {
                    addressTextView.text = address ?: getString(R.string.address_placeholder)
                }
            }
        }
    }

    private fun addHeatmapOverlay(map: GoogleMap) {
        val tileProvider = object : UrlTileProvider(256, 256) {
            override fun getTileUrl(x: Int, y: Int, zoom: Int): URL? {
                val url = String.format(
                    Locale.US,
                    "https://tile.googleapis.com/v1/airquality/heatmap/%d/%d/%d.png?key=%s",
                    zoom,
                    x,
                    y,
                    "YOUR_GOOGLE_MAPS_API_KEY"
                )
                return try {
                    URL(url)
                } catch (error: MalformedURLException) {
                    null
                }
            }
        }
        map.addTileOverlay(
            TileOverlayOptions()
                .tileProvider(tileProvider)
                .transparency(0.35f)
        )
    }

    private fun enableMyLocation() {
        val map = googleMap ?: return
        if (ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED
        ) {
            map.isMyLocationEnabled = true
        }
    }

    private fun requestLocationPermission() {
        if (ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED
        ) {
            enableMyLocation()
        } else {
            locationPermissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
        }
    }

    private fun showPermissionDeniedMessage() {
        val rootView = findViewById<MaterialCardView>(R.id.bottom_sheet_container)
        Snackbar.make(rootView, R.string.address_placeholder, Snackbar.LENGTH_SHORT).show()
    }
}
