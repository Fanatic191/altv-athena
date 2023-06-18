--server.lua
RegisterServerEvent("replace-texture-server")
AddEventHandler("replace-texture-server", function()
    TriggerClientEvent("replace-texture-client", -1)
end)