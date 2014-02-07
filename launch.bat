@echo off
xcopy C:\wamp\www\JdrInter G:\Projets\JdrInter /d /e /i /h /y /exclude:C:\wamp\www\JdrInter\exclude.txt
cd C:\wamp\www\JdrInter
foreman start &
