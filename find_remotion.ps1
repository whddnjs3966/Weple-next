Get-ChildItem -Recurse -Include *.ts, *.tsx, *.js, *.mjs | 
Where-Object { $_.FullName -notmatch 'node_modules|\\.git|\\.claude|\\.next' } | 
Select-String "remotion"
