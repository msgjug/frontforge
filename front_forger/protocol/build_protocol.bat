.\build_protocol.exe -v 3.2 -i ./ -l ts
echo y|echo f| xcopy /y /c /s /h /r "protocol_dist.ts" "..\src\classes\protocol_dist.ts"
del protocol_dist.ts