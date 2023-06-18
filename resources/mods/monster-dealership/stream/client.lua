RegisterCommand("tvon",function() -- This is the command.
    TriggerServerEvent("replace-texture-server")
end)

RegisterNetEvent("replace-texture-client")
AddEventHandler("replace-texture-client",function()
    local txd = CreateRuntimeTxd('duiTxd')
    local duiObj = CreateDui('https://i.imgur.com/nrGv1JE.gifv', 500, 300) -- "https://i.imgur.com/nrGv1JE.gifv" GIF resolution must be 450x300px.
    _G.duiObj = duiObj
    local dui = GetDuiHandle(duiObj)
    local tx = CreateRuntimeTextureFromDuiHandle(txd, 'duiTex', dui)
    AddReplaceTexture('j13_anim_tv_screen_01', 'xm_prop_x17_screens_02a_tv', 'duiTxd', 'duiTex') -- DON'T TOUCH :).
end)