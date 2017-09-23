/tool fetch url="http://myip.dnsomatic.com/" mode=http dst-path=mypublicip.txt;{~n}
:delay 5 ;{~n}
:global publicIp [/file get [/file find name=mypublicip.txt] contents ] ;{~n}
:global str "/api/radius/updateIp/{businessId}/{nasId}/$publicIp" ;{~n}
:delay 5 ;{~n}
/tool fetch address="{apiDomain}" host="{apiDomain}" port={apiPort} src-path=$str mode=http ;{~n}