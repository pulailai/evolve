# Market Flow - macOS Application

This directory contains assets for building the macOS application.

## Required Files

### icon.icns (Required for custom icon)
- macOS application icon
- Size: 1024x1024 pixels
- Format: .icns (Apple Icon Image)

To create an icon:
1. Prepare a 1024x1024 PNG image
2. Use an online converter or macOS iconutil to convert to .icns
3. Place the file here as `icon.icns`

### background.png (Optional for DMG)
- DMG installer background image
- Recommended size: 540x380 pixels
- Format: PNG

If not provided, electron-builder will use default styling.

## Note

If these files are not provided, electron-builder will use default icons and styling.
The application will still build successfully.
