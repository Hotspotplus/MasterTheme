:global sharedSecret "{sharedSecret}" ;{~n}
:global radiusIp "{radiusIp}" ;{~n}
:global radiusAccPort "{radiusAccPort}" ;{~n}
:global radiusAuthPort "{radiusAuthPort}" ;{~n}
:global nasIdentity "{nasId}" ;{~n}
:global hotspotDynamicIp "{hotspotDynamicIp}" ;{~n}
:global hotspotDomain     "{hotspotDomain}" ;{~n}

/system identity set name $nasIdentity  ;{~n}
:put "Nas identity changed." ;{~n}
/system ntp client set enabled=yes primary-ntp=193.190.147.153  ;{~n}
:put "Ntp adjusted" ;{~n}
/system clock manual set time-zone=+03:30  ;{~n}
:put "Clock adjusted" ;{~n}
/system clock set time-zone-name=Asia/Tehran  ;{~n}
:put "Timezone changed" ;{~n}
/radius add service=hotspot address=$radiusIp secret=$sharedSecret authentication-port=$radiusAuthPort accounting-port=$radiusAccPort timeout=00:00:05.00 ;{~n}
:do {~lb}
    /system scheduler remove dynamicIpSchedulaer ;{~n}
{~rb} on-error={~lb} :put "Try to remove old dynamic scheduler failed"{~rb} ;{~n}
/system scheduler add name=dynamicIpSchedulaer on-event=$hotspotDynamicIp  interval={nasUpdateInterval}s disabled=no  ;{~n}
:put "Scheduler added" ;{~n}
:do {~lb}
    /system script remove $hotspotDynamicIp ;{~n}
{~rb} on-error={~lb} :put "Try to remove old dynamic ip failed"{~rb} ;{~n}

:if ([:len [/file find name=$hotspotDynamicIp]] > 0) do={~lb}{~n}
    :global hotspotDynamicIpPath "$hotspotDynamicIp" ;{~n}
    /system script add name=$hotspotDynamicIp source=[/file get $hotspotDynamicIpPath contents ] policy=read,test,write ;{~n}
    :put "script found in root" ;{~n}
{~rb} else={~lb}{~n}
    :global hotspotDynamicIpPath "flash/$hotspotDynamicIp" ;{~n}
    /system script add name=$hotspotDynamicIp source=[/file get $hotspotDynamicIpPath contents ] policy=read,test,write ;{~n}
    :put "script found in flash" ;{~n}
{~rb}{~n}

:put "Dynamic ip script added!" ;{~n}
/ip hotspot walled-garden add dst-host=$hotspotDomain action=allow ;{~n}
:put "Walled garden added for hotspot" ;{~n}
/ip hotspot walled-garden add dst-host=zarinpal.com action=allow ;{~n}
:put "Walled garden added for: zarinpal.com" ;{~n}
/ip hotspot walled-garden add dst-host=*.zarinpal.com action=allow ;{~n}
:put "Walled garden added for: *.zarinpal.com" ;{~n}
/ip hotspot walled-garden add dst-host=pay.ir action=allow ;{~n}
:put "Walled garden added for: pay.ir" ;{~n}
/ip hotspot walled-garden add dst-host=*.pay.ir action=allow ;{~n}
:put "Walled garden added for: *.pay.ir" ;{~n}
/ip hotspot walled-garden add dst-host=hotspotplus.ir action=allow ;{~n}
:put "Walled garden added for: hotspotplus.ir" ;{~n}
/ip hotspot walled-garden add dst-host=*.hotspotplus.ir action=allow ;{~n}
:put "Walled garden added for: *.hotspotplus.ir" ;{~n}
/ip hotspot walled-garden add dst-host=*.spotio.ir action=allow ;{~n}
:put "Walled garden added for: *.spotio.ir" ;{~n}
/ip hotspot walled-garden add dst-host=*.shaparak.ir action=allow ;{~n}
:put "Walled garden added for: *.shaparak.ir" ;{~n}
:put "Done!, welcome to hotspot plus" ;{~n}