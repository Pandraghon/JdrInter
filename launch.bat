cd C:\wamp\www\JdrInter
xcopy public G:\Projets\JdrInter\public /e /i /y /exclude:exclude.txt
xcopy index.html G:\Projets\JdrInter /e /i /y /exclude:exclude.txt
xcopy package.json G:\Projets\JdrInter /e /i /y /exclude:exclude.txt
xcopy Procfile G:\Projets\JdrInter /e /i /y
xcopy server.js G:\Projets\JdrInter /e /i /y /exclude:exclude.txt
foreman start &
