@echo off
cd /d C:\Users\chiyo\projects\chiyoda-estate-hp
if defined PORT (
  C:\Users\chiyo\nodejs\npx.cmd next dev --turbopack -p %PORT%
) else (
  C:\Users\chiyo\nodejs\npx.cmd next dev --turbopack -p 3000
)
