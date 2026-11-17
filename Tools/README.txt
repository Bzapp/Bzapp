INSTALAÇÃO - BP POWER CAR SERVICE / LOGIN MAF

1. Envie todos os ficheiros desta pasta para o seu alojamento PHP.
2. Certifique-se de que o PHP tem PDO_SQLite ativo.
3. Abra no navegador: https://SEU-DOMINIO/setup.php
4. Crie o utilizador administrador.
5. Apague o ficheiro setup.php do servidor.
6. Abra: https://SEU-DOMINIO/index.php
7. Entre com o administrador.
8. Em "Administração" pode criar utilizadores normais ou administradores, ativar/desativar e eliminar contas.

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

