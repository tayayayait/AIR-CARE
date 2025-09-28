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
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import com.aircare.databinding.ActivityMainBinding
import com.aircare.BuildConfig
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.LatLngBounds
import com.google.android.gms.maps.model.TileOverlayOptions
import com.google.android.gms.maps.model.UrlTileProvider
import com.google.android.material.appbar.MaterialToolbar
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

    private lateinit var binding: ActivityMainBinding
    private var googleMap: GoogleMap? = null
    private lateinit var addressTextView: TextView
    private lateinit var coordinatesTextView: TextView
    private lateinit var updatedAtTextView: TextView
    private lateinit var bottomSheetBehavior: com.google.android.material.bottomsheet.BottomSheetBehavior<MaterialCardView>
    private lateinit var fusedLocationClient: FusedLocationProviderClient

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
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        PlacesSearch.initialize(application)

        addressTextView = binding.textAddress
        coordinatesTextView = binding.textCoordinates
        updatedAtTextView = binding.textUpdatedAt

        val bottomSheetCard: MaterialCardView = binding.bottomSheetContainer
        bottomSheetBehavior = com.google.android.material.bottomsheet.BottomSheetBehavior.from(bottomSheetCard)
        bottomSheetBehavior.state = com.google.android.material.bottomsheet.BottomSheetBehavior.STATE_COLLAPSED

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

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

        // Toolbar 설정 및 검색 메뉴 클릭 처리
        val toolbar: MaterialToolbar = findViewById(R.id.top_app_bar)
        toolbar.setOnMenuItemClickListener { menuItem ->
            if (menuItem.itemId == R.id.action_search) {
                PlacesSearch.launchAutocomplete(this, autocompleteLauncher)
                true
            } else {
                false
            }
        }

        // 상태바 인셋 적용
        ViewCompat.setOnApplyWindowInsetsListener(toolbar) { view, windowInsets ->
            val insets = windowInsets.getInsets(WindowInsetsCompat.Type.statusBars())
            view.setPadding(
                view.paddingLeft,
                insets.top,
                view.paddingRight,
                view.paddingBottom
            )
            windowInsets
        }
        ViewCompat.requestApplyInsets(toolbar)

        val mapFragment = supportFragmentManager
            .findFragmentById(R.id.map_fragment) as SupportMapFragment
        mapFragment.getMapAsync(this)

        requestLocationPermission()
    }

    override fun onMapReady(map: GoogleMap) {
        googleMap = map
        val southWest = LatLng(33.0, 124.0)
        val northEast = LatLng(38.0, 132.0)
        val southKoreaBounds = LatLngBounds(southWest, northEast)
        val padding = 100
        map.moveCamera(CameraUpdateFactory.newLatLngBounds(southKoreaBounds, padding))
        map.setLatLngBoundsForCameraTarget(southKoreaBounds)
        map.uiSettings.isMyLocationButtonEnabled = true
        map.uiSettings.isZoomControlsEnabled = true

        addHeatmapOverlay(map)

        map.setOnCameraIdleListener(this)
        map.setOnMyLocationButtonClickListener {
            if (ContextCompat.checkSelfPermission(
                    this,
                    Manifest.permission.ACCESS_FINE_LOCATION
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                showPermissionDeniedMessage()
                return@setOnMyLocationButtonClickListener true
            }

            fusedLocationClient.lastLocation
                .addOnSuccessListener { location ->
                    if (location != null) {
                        val currentLatLng = LatLng(location.latitude, location.longitude)
                        map.animateCamera(
                            CameraUpdateFactory.newLatLngZoom(
                                currentLatLng,
                                15f
                            )
                        )
                    } else {
                        showLocationUnavailableMessage()
                    }
                }
                .addOnFailureListener {
                    showLocationUnavailableMessage()
                }
            true
        }
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
            val apiKey = BuildConfig.GOOGLE_MAPS_API_KEY
            if (apiKey.isBlank()) {
                withContext(Dispatchers.Main) {
                    if (!isFinishing && !isDestroyed) {
                        addressTextView.text = getString(R.string.address_placeholder)
                    }
                }
                return@launch
            }

            val address = Geo.reverseGeocode(
                target.latitude,
                target.longitude,
                apiKey
            )
            withContext(Dispatchers.Main) {
                if (!isFinishing && !isDestroyed) {
                    addressTextView.text = address ?: getString(R.string.address_placeholder)
                }
            }
        }
    }

    private fun addHeatmapOverlay(map: GoogleMap) {
        val apiKey = BuildConfig.GOOGLE_MAPS_API_KEY
        if (apiKey.isBlank()) return

        val tileProvider = object : UrlTileProvider(256, 256) {
            override fun getTileUrl(x: Int, y: Int, zoom: Int): URL? {
                val url = String.format(
                    Locale.US,
                    "https://tile.googleapis.com/v1/airquality/heatmap/%d/%d/%d.png?key=%s",
                    zoom, x, y, apiKey
                )
                return try {
                    URL(url)
                } catch (_: MalformedURLException) {
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
        val rootView = binding.bottomSheetContainer
        Snackbar.make(rootView, R.string.permission_denied_message, Snackbar.LENGTH_SHORT).show()
    }

    private fun showLocationUnavailableMessage() {
        val rootView = binding.bottomSheetContainer
        Snackbar.make(rootView, R.string.location_unavailable_message, Snackbar.LENGTH_SHORT).show()
    }
}
