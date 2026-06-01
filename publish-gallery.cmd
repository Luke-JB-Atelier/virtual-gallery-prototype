@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\publish-gallery.ps1" %*
