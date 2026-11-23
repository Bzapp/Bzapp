INSTALAÇÃO - BP POWER CAR SERVICE / LOGIN MAF (cPanel)

1. No cPanel → Gestor de ficheiros, abra a pasta do site (ex. public_html/Tools).
2. Envie / substitua os ficheiros PHP desta pasta (não precisa de start.bat — isso é só PC).
3. Pasta data/ tem de ser gravável (permissões 755 ou 775; o PHP cria app.sqlite aí).
4. PHP com extensão pdo_sqlite (Seleccionar versão do PHP → Extensões).
5. Abra: https://SEU-DOMINIO/Tools/setup.php
6. Crie o utilizador administrador.
7. Apague setup.php do servidor depois do setup.
8. Abra: https://SEU-DOMINIO/Tools/index.php

CORRECÇÃO setup (erro UNIQUE brands.name):
- Basta substituir config.php no servidor (FTP ou Gestor de ficheiros).
- Não apague data/app.sqlite — a base e os manuais mantêm-se.
- Recarregue setup.php; o erro rosa UNIQUE deve desaparecer.

A base de dados fica em data/app.sqlite.
As palavras-passe são guardadas com password_hash() e não em texto simples.

NOTA:
- O conversor é carregado em app.php depois do login.
- Pode substituir conversores.html pela versão que quiser manter.
- Recomenda-se HTTPS no domínio.

FLUXÓMETRO:
- Calcula só ralenti e plena carga.
- Base em mg/ciclo @ 1900 ccm; g/s e kg/h derivam dessa base
  (g/s = mg/ciclo × ciclos/s ÷ 1000; kg/h = g/s × 3,6).
