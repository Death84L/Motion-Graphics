--[[
  Motion Studio - Universal DaVinci Resolve Fusion Bridge
  Author: Motion Studio Open-Source
  
  Place this script into:
  Windows: %APPDATA%\Blackmagic Design\DaVinci Resolve\Support\Fusion\Scripts\Comp\MotionStudio.lua
  macOS: ~/Library/Application Support/Blackmagic Design/DaVinci Resolve/Fusion/Scripts/Comp/MotionStudio.lua
--]]

local fusion = Fusion()
local comp = fusion.CurrentComp

if not comp then
    print("[Motion Studio] Please open a Fusion Composition in DaVinci Resolve first.")
    return
end

print("[Motion Studio] Universal Host Bridge Connected to DaVinci Resolve Fusion.")

-- Launch Motion Studio UI in Default Browser or Web Panel
local hostUrl = "http://localhost:5173"
if ffi and ffi.os == "Windows" then
    os.execute('start ' .. hostUrl)
else
    os.execute('open ' .. hostUrl)
end
