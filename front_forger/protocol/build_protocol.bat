.\build_protocol.exe -v 3.2 -i ./ -l ts
echo y|echo f| xcopy /y /c /s /h /r "protocol_dist.ts" "..\src\renderer\src\protocol_dist.ts"
echo y|echo f| xcopy /y /c /s /h /r "protocol_dist.ts" "..\src\main\protocol_dist.ts"
del protocol_dist.ts