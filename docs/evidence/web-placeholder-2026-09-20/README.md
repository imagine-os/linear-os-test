# Evidence: web placeholder screen (2026-09-20)

Headless Chromium captures of `apps/web` built with `BASE_PATH=/linear-os-test/app/` and served
under that prefix. Console errors: 0. Failed requests: 0. Text present at both viewports.

| File | What |
| -- | -- |
| `app-before-desktop.png` | the live `/app/` before the fix at 1920x1080: title and SHA only (Justin: "doesn't show anything") |
| `app-after-mobile.png` | 390x844 |
| `app-after-desktop.png` | 1920x1080 |
| `app-after-toast.png` | 1280x800 after activating the `Sign in` placeholder: the "not wired yet" toast |
| `app-after-es.png` | 1280x800 after the EN/ES toggle: Spanish copy, `<html lang="es">` |
| `app-live-desktop.png` | the deployed https://imagine-os.github.io/linear-os-test/app/ after the Pages redeploy of `f523061`, 1920x1080, 0 console errors |
| `app-live-mobile.png` | same live page at 390x844, 0 console errors |
