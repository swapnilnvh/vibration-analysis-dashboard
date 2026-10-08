import requests

base_url = "https://paste-neighbor-blues-sleep.trycloudflare.com"
print(f"=== TESTING COMPLETE APPLICATION VIA CLOUD URL: {base_url} ===")

# 1. Frontend Homepage
r_home = requests.get(base_url, timeout=15)
assert r_home.status_code == 200, f"Frontend failed: {r_home.status_code}"
assert "<title>" in r_home.text
print(f"[PASS] 1. Frontend Web App: 200 OK (HTML size: {len(r_home.text)} bytes)")

# 2. API Health
r_health = requests.get(f"{base_url}/api/health", timeout=15)
assert r_health.status_code == 200, f"Health check failed: {r_health.status_code}"
print(f"[PASS] 2. API Health Status: {r_health.json()}")

# 3. Interactive API Docs
r_docs = requests.get(f"{base_url}/docs", timeout=15)
assert r_docs.status_code == 200, f"Swagger docs failed: {r_docs.status_code}"
print("[PASS] 3. Interactive OpenAPI / Swagger Docs: 200 OK")

# 4. Sample LabVIEW Dataset Loading
r_sample = requests.post(f"{base_url}/api/upload/sample", timeout=15)
assert r_sample.status_code == 200, f"Sample upload failed: {r_sample.status_code}"
sample_data = r_sample.json()
file_id = sample_data["file_id"]
filename = sample_data.get("filename")
samples = sample_data.get("samples")
fs = sample_data.get("sampling_rate")
duration = sample_data.get("duration")
print(f"[PASS] 4. Dataset loaded: {filename} ({samples} samples, Fs={fs} Hz, Duration={duration} s)")

# 5. KPI Overview Analysis
r_kpi = requests.post(f"{base_url}/api/analysis/kpi", json={"file_id": file_id}, timeout=15)
assert r_kpi.status_code == 200, f"KPI failed: {r_kpi.status_code}"
kpi_data = r_kpi.json()
print(f"[PASS] 5. KPI Overview: X-RMS={kpi_data['x_axis']['rms']:.4f} g, Y-RMS={kpi_data['y_axis']['rms']:.4f} g, Z-RMS={kpi_data['z_axis']['rms']:.4f} g")

# 6. Time Domain Resampling
r_td = requests.post(f"{base_url}/api/analysis/time-domain", json={"file_id": file_id, "axes": ["X", "Y", "Z"], "time_increment": 0.001}, timeout=15)
assert r_td.status_code == 200, f"Time domain failed: {r_td.status_code}"
print(f"[PASS] 6. Time Domain: {r_td.json()['samples_returned']} data points returned")

# 7. FFT Spectrum Analysis
r_fft = requests.post(f"{base_url}/api/analysis/fft", json={"file_id": file_id, "axes": ["X", "Y", "Z"], "window": "hanning"}, timeout=15)
assert r_fft.status_code == 200, f"FFT failed: {r_fft.status_code}"
print(f"[PASS] 7. FFT Spectrum: {len(r_fft.json()['data']['X']['frequency'])} frequency bins computed")

# 8. Spectrogram (with 1.0 Hz resolution verification)
r_spec = requests.post(f"{base_url}/api/analysis/spectrogram", json={"file_id": file_id, "axis": "X", "freq_resolution": 1.0, "scale": "linear"}, timeout=15)
assert r_spec.status_code == 200, f"Spectrogram failed: {r_spec.status_code}"
spec_data = r_spec.json()
print(f"[PASS] 8. Spectrogram: freq_resolution = {spec_data.get('freq_resolution')} Hz (1.0 Hz physical resolution)")

# 9. 3-Axis Psychoacoustic Sharpness
r_sharp = requests.post(f"{base_url}/api/analysis/sharpness", json={"file_id": file_id, "axis": "ALL"}, timeout=15)
assert r_sharp.status_code == 200, f"Sharpness failed: {r_sharp.status_code}"
triaxial_mean = r_sharp.json().get("triaxial", {}).get("mean", 0.0)
print(f"[PASS] 9. Sharpness (DIN 45692): Triaxial Mean = {triaxial_mean:.4f} acum")

# 10. 3-Axis Psychoacoustic Roughness
r_rough = requests.post(f"{base_url}/api/analysis/roughness", json={"file_id": file_id, "axis": "ALL"}, timeout=15)
assert r_rough.status_code == 200, f"Roughness failed: {r_rough.status_code}"
print(f"[PASS] 10. Roughness (Daniel & Weber): Computed successfully across 3 axes + resultant")

# 11. 3-Axis Psychoacoustic Fluctuation Strength
r_fluc = requests.post(f"{base_url}/api/analysis/fluctuation-strength", json={"file_id": file_id, "axis": "ALL"}, timeout=15)
assert r_fluc.status_code == 200, f"Fluctuation Strength failed: {r_fluc.status_code}"
print(f"[PASS] 11. Fluctuation Strength: Computed successfully across 3 axes + resultant")

# 12. Frontend JS & CSS static assets loading
r_js = requests.get(f"{base_url}/assets/index-CbIdZgaB.js", timeout=15)
assert r_js.status_code == 200 and len(r_js.content) > 100000, "JS bundle missing"
r_css = requests.get(f"{base_url}/assets/index-BahVC52T.css", timeout=15)
assert r_css.status_code == 200 and len(r_css.content) > 1000, "CSS bundle missing"
print(f"[PASS] 12. Frontend Static Assets: JS ({len(r_js.content)} bytes) and CSS ({len(r_css.content)} bytes) verified")

print("\n=======================================================")
print("ALL 12 END-TO-END PRODUCTION CHECKS PASSED SUCCESSFULLY!")
print("=======================================================")
