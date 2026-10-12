(function(){
  if (window.__aariIcaGate) return; window.__aariIcaGate = 1;

  var client = (window.sb && window.sb.auth && window.sb.auth.getSession) ? window.sb
    : (window.__sb && window.__sb.auth && window.__sb.auth.getSession) ? window.__sb
    : null;
  if (!client) return;

  var AARI_LOGO = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDk5IDkzMiIgcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pZFlNaWQgbWVldCI+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsOTMyKSBzY2FsZSgwLjEsLTAuMSkiIGZpbGw9IiNmZmYiIHN0cm9rZT0ibm9uZSI+CjxwYXRoIGQ9Ik0xNjk3NSA4OTA5IGMtMTYwIC0yMyAtMjc4IC04MSAtMzg2IC0xODkgLTEyNiAtMTI2IC0xODUgLTI1NiAtMTk2Ci00MzUgLTE1IC0yNTcgMTE2IC00OTQgMzQ3IC02MjMgMTQwIC03OCAzNDAgLTEwMSA0ODUgLTU1IDE1MyA0OSAyOTAgMTQyIDM1NAoyNDEgOTcgMTUxIDExOSAzNzYgNTYgNTY3IC0xNiA0NiAzOCAtMzMgODAgLTEyMCAxMDEgLTIwNSAxMjAgLTQ0NiA1MCAtNjMyCi05MyAtMjQ2IC0zNjggLTUzNCAtNzA1IC03MzUgLTI2OCAtMTYwIC02NzEgLTMzOCAtMTA5NSAtNDgyIGwtODAgLTI4IDMgLTc2CmMyIC00NCA5IC04MCAxNSAtODQgNyAtNCAyOCAtOCA0NyAtOCA4NCAtMSAxODYgLTQyIDI1NSAtMTAyIDU0IC00NyAxMjQgLTE4MgoxNTggLTMwMyBsMjIgLTgwIDAgLTk4NSAwIC05ODUgLTIzIC04MCBjLTgzIC0yODkgLTMwOCAtNTI0IC01ODQgLTYxMSBsLTU4Ci0xOCAwIC04MyAwIC04MyAxMzMwIDAgMTMzMCAwIDAgODQgMCA4NCAtNTIgMTggYy0yMzQgNzYgLTQyNCAyNDQgLTUyNyA0NjUKLTgyIDE3NiAtNzUgMjEgLTc4IDE3MDIgbC0zIDE0OTggNDkgOTIgYzE4NCAzNDIgMjc0IDY3NyAyNTYgOTQ3IC0yMyAzNDYKLTEyMiA1NzUgLTM0OSA4MDQgLTIwNiAyMDkgLTQ4NSAzMjYgLTcwMSAyOTV6Ii8+CjxwYXRoIGQ9Ik0zMzQ1IDg4MzMgYy0xMjMgLTIwNiAtMjgzIC0zODMgLTQ1NSAtNTA1IC0xMTggLTg0IC0zMDAgLTE3NSAtNDQ3Ci0yMjMgLTYyIC0yMSAtMTExIC00MCAtMTA5IC00NCAyIC0zIDIyIC00NCA0NCAtOTEgMjIgLTQ3IDk3IC0yMDEgMTY2IC0zNDQKNjkgLTE0MiAxMjYgLTI2NCAxMjYgLTI3MSAwIC0xNSAtOTUgLTI0MyAtNjQ1IC0xNTUwIC03OSAtMTg3IC0yNzggLTY2MiAtNDQzCi0xMDU1IC00MTYgLTk5MiAtNDA4IC05NzQgLTQ2MyAtMTA4MCAtNjUgLTEyMyAtMTYxIC0yNTMgLTI3NCAtMzY1IC0xMTQgLTExNAotMjMxIC0xNzggLTM2MyAtMTk3IGwtODMgLTEyIDMgLTgxIDMgLTgwIDkxNSAwIDkxNSAwIDMgODEgMyA4MSAtNjMgNyBjLTE0OQoxNyAtMzE0IDk5IC00NDkgMjI0IC05MSA4NSAtMTMxIDE1MCAtMTYwIDI1OCAtMzcgMTQzIC0xOCAyNDAgMTAzIDUyNyA0NSAxMDUKMTI1IDI5NiAxNzkgNDIyIGw5NyAyMzAgOTk1IDMgOTk0IDIgNjMgLTEzMiBjMzUgLTczIDEzOCAtMjg0IDIyOCAtNDY4IDE5NAotMzk4IDIxMyAtNDQ4IDIyMCAtNTg3IDYgLTEyMiAtMTYgLTIwNiAtNzYgLTI5OCAtNzAgLTEwNyAtMTQxIC0xNTcgLTI1MgotMTc4IGwtNjEgLTEyIDMgLTgwIDMgLTgwIDE0MTMgLTMgMTQxMiAtMiAwIDgzIDAgODMgLTEwMCAxMiBjLTIyMyAyOCAtMzkzCjExOSAtNTk4IDMyMCAtMTE1IDExMiAtMjE0IDIzOCAtMjkwIDM2NSAtMzMgNTYgLTE4MCAzNTAgLTMyNyA2NTIgLTE0OCAzMDMKLTMyNCA2NjUgLTM5MyA4MDUgLTY4IDE0MCAtMjA0IDQxOSAtMzAyIDYyMCAtOTggMjAxIC0yMzUgNDgyIC0zMDUgNjI1IC03MAoxNDMgLTE1OCAzMjMgLTE5NSA0MDAgLTM3IDc3IC0xMzIgMjcxIC0yMTAgNDMwIC03OCAxNjAgLTE2NiAzNDAgLTE5NSA0MDAKLTI5IDYxIC0xMjggMjYzIC0yMjAgNDUwIC05MiAxODcgLTE4NCAzNzkgLTIwNSA0MjYgLTQ2IDEwMyAtMTQ5IDMwOSAtMTU0CjMwOSAtMiAwIC0yNSAtMzUgLTUxIC03N3ogbS0zMDggLTIyMjAgYzkxIC0xODYgMTg3IC0zODMgMjEzIC00MzggMjYgLTU1IDEwNQotMjE3IDE3NSAtMzYwIDI1MCAtNTExIDM0NSAtNzA4IDM0NSAtNzE2IDAgLTExIC0xNjY3IC0xMiAtMTY3MyAtMSAtMyA0IDI2Cjc5IDYzIDE2NyAxMDYgMjUwIDU1OSAxMzMxIDYzNiAxNTE3IDM4IDkyIDcwIDE2OCA3MiAxNjggMiAwIDc4IC0xNTIgMTY5Ci0zMzd6Ii8+CjxwYXRoIGQ9Ik0xMzEwNSA3MDUzIGMtMzE0IC0yODYgLTY1NyAtNDYwIC0xMDcwIC01NDIgLTIyMiAtNDQgLTM2NiAtNzggLTM3NwotODkgLTUgLTUgLTggLTQyIC02IC04MyBsMyAtNzQgNjcgLTcgYzIwNCAtMjMgMzIzIC0xMzUgMzg3IC0zNjYgMzkgLTE0NCA0MgotMjI4IDM5IC0xMTcyIC0zIC05MDIgLTQgLTkwNSAtMjYgLTk4NSAtMTIgLTQ0IC0zOCAtMTEzIC01NyAtMTU0IC0xMDQgLTIxOQotMzEyIC00MDEgLTUzMCAtNDY1IGwtNDAgLTEyIC0zIC04NyAtMyAtODcgMTMyOCAyIDEzMjggMyAwIDg0IDAgODMgLTU3IDE4CmMtMzA3IDk1IC01NDkgMzgyIC01OTcgNzA3IC03IDQ1IC0xMSAzMTYgLTExIDcyNSBsMCA2NTMgNTYgOTkgYzExNyAyMDcgMjM4CjM3MSAzODQgNTE4IGwxMDcgMTA3IDYgMTEzIGMxMiAyMTkgNzUgMzg1IDE5NSA1MDggbDYzIDY1IC0zNiAtNjYgYy0xMTUgLTIxNAotMTI0IC00MTkgLTI1IC01OTQgMTA0IC0xODYgMjM1IC0yOTMgNDE1IC0zNDAgNzkgLTIxIDI0MSAtMjEgMzI5IC0xIDIyMCA1MQo0MDMgMjI0IDQ4MiA0NTYgMzAgODcgMjcgMzAwIC01IDM5OSAtNzEgMjE2IC0yODQgNDA1IC01MDQgNDQ2IC05OCAxOSAtMTY2CjE5IC0yODcgMCAtMjIzIC0zMyAtNDIyIC0xMzAgLTY3MiAtMzI1IC0xMTIgLTg4IC0zMzcgLTMxNSAtNDIzIC00MjcgLTM4IC01MQotNzMgLTkyIC03NyAtOTIgLTUgLTEgLTggMjMxIC04IDUxNCBsMCA1MTUgLTE2MiAwIC0xNjMgLTEgLTUwIC00NnoiLz4KPHBhdGggZD0iTTgwODUgNzA2NCBjLTMyNyAtNTcgLTY0MSAtMjUwIC04MzcgLTUxNCAtMTE3IC0xNTkgLTE1OCAtMjY1IC0xNjUKLTQzNSAtOSAtMjEzIDQ5IC0zNjkgMTkxIC01MTAgODggLTg3IDE1OCAtMTMwIDI3MCAtMTY0IDk3IC0zMCAyNzYgLTMwIDM3MiAwCjI0NCA3NSA0MTkgMjYyIDQ2OCA1MDIgMzEgMTQ5IDE0IDI3NCAtNTggNDIzIC01MyAxMTEgLTEyMSAxODMgLTIyMiAyMzYgLTY5CjM2IC0xOTYgNzcgLTI0NCA3OSAtNTYgMSAxNSAxOCA4MiAxOCAxMzkgMiAyNzYgLTQwIDM4MSAtMTE1IGw0OSAtMzUgMTYgMjMKYzkzIDEzMiAyNTIgMTk4IDQwNyAxNjkgOTYgLTE3IDE1MSAtNDYgMjIwIC0xMTYgNjMgLTYyIDk3IC0xMjIgMTE1IC0xOTcgNgotMjYgMTAgLTMwMCAxMCAtNjkyIGwwIC02NDkgLTUyIDYgYy0xMzkgMTcgLTQ1OSAyOCAtNjAzIDIyIC00OTIgLTIwIC04NDkKLTExNSAtMTEzMSAtMzAxIC0xMDMgLTY4IC0yNjMgLTIyMiAtMzIyIC0zMTAgLTEzMCAtMTk0IC0xOTEgLTM4MyAtMjE0IC02NTkKLTI3IC0zMjQgNTEgLTU1NSAyNTcgLTc2MCAyMDYgLTIwNSA0MDcgLTI3MSA4NzAgLTI4MiA1MTcgLTEzIDkwNSA0NiAxMzEzCjE5OSBsMTMzIDUwIDQ3IC00NCBjMTQxIC0xMzIgMzAyIC0yMTQgNDg1IC0yNDkgMTI5IC0yNSA0MjUgLTEyIDczMiAzMiAxMzAKMTggNjMxIDExNiA2NDggMTI2IDQgMiA3IDQxIDcgODYgbDAgODMgLTkyIDExIGMtMTk4IDIzIC00MjIgMTMwIC01NjIgMjY3Ci0xMDAgOTggLTE0MSAxODcgLTE3MSAzNzAgLTEyIDc2IC0xNSAyNjMgLTE1IDExMjEgMCAxMDk0IC0xIDExMTAgLTQ4IDEyNzUKLTg0IDI4OSAtMjg2IDU1OCAtNTUyIDczNiAtMTU4IDEwNSAtMzEwIDE2NCAtNTE0IDE5OSAtMTI0IDIxIC0xMTQ5IDIxIC0xMjcxCi0xeiBtMTA1NyAtMjk1NCBjMSAtMzUyIDIgLTY1MCAyIC02NjIgMSAtMjAgLTcgLTI1IC01OSAtMzYgLTEwNiAtMjIgLTM0OAotMjcgLTQ0NSAtOCAtMTkyIDM2IC0zNTUgMTU2IC00MTggMzA4IC01MiAxMjYgLTY0IDE4MyAtNjkgMzMzIC02IDE2MiA2IDIyNAo2NSAzNDUgNTIgMTA3IDE4NyAyNDIgMjk0IDI5NSAxMTcgNTcgMTU2IDYzIDQwNiA2NCBsMjIyIDEgMiAtNjQweiIvPgo8cGF0aCBkPSJNMTk3NjQgNDI2MCBjLTI0MiAtNjMgLTQ0MCAtMjY5IC00ODUgLTUwMyAtMTMgLTcwIC0xMiAtMjE5IDEgLTI4Nwo3IC0zMCAzMCAtOTMgNTIgLTE0MCAzNCAtNzAgNTYgLTEwMSAxMzIgLTE3NiAxNDQgLTE0NCAyNzUgLTE5OCA0ODEgLTE5NiAxODkKMiAzMjIgNTggNDU1IDE5MiA5MiA5MSAxNDMgMTc0IDE3NiAyODUgMjggOTIgMjYgMjc3IC00IDM3NSAtNTQgMTczIC0xNzkgMzIzCi0zMzggNDAzIC0xMzAgNjYgLTMyNSA4NSAtNDcwIDQ3eiIvPgo8cGF0aCBkPSJNOTE4MiAxNjAzIGMtNTkgLTE1NiAtMzkxIC05NjIgLTQyMSAtMTAyMSAtMjUgLTQ5IC05MyAtMTExIC0xMzEKLTExOSAtMjEgLTQgLTMwIC0xMSAtMzAgLTI0IDAgLTE4IDEwIC0xOSAxNjUgLTE5IDEzOSAwIDE2NSAyIDE2NSAxNSAwIDggLTE1CjIxIC0zNCAyOSAtMzcgMTUgLTY2IDUwIC02NiA4MCAwIDExIDIxIDcxIDQ2IDEzMyBsNDcgMTEzIDI1MCAtMiAyNTEgLTMgNDMKLTEwNSBjNTYgLTEzNyA0OSAtMTgxIC0zNCAtMjE3IC0xOCAtNyAtMzMgLTIwIC0zMyAtMjggMCAtMTMgMzUgLTE1IDI1MCAtMTUKMjQzIDAgMjUwIDEgMjUwIDIwIDAgMTQgLTcgMjAgLTIzIDIwIC00MCAwIC0xMTggNjMgLTE0NyAxMjAgLTE2IDMxIC0zNDYgODMxCi00MDcgOTg4IGwtMjUgNjIgLTUzIDAgYy00OSAwIC01NCAtMiAtNjMgLTI3eiBtMTAzIC00NzggYzU0IC0xMzIgMTAwIC0yNDYKMTAyIC0yNTIgNCAtMTAgLTQyIC0xMyAtMjExIC0xMyAtMTU0IDAgLTIxNiAzIC0yMTYgMTEgMCA2IDQxIDExMSA5MSAyMzMgNTEKMTIxIDk4IDIzNyAxMDYgMjU2IDExIDI3IDE2IDMyIDIzIDIwIDQgLTggNTIgLTEyMyAxMDUgLTI1NXoiLz4KPHBhdGggZD0iTTE4NDIgMTU4NCBjMiAtOSAyMCAtMjIgNDEgLTI5IDIyIC03IDUwIC0yMyA2MyAtMzYgbDI0IC0yMiAwIC00ODIKYzAgLTQ3MyAwIC00ODMgLTIxIC01MDkgLTEyIC0xNiAtMzggLTMxIC02NSAtMzcgLTMyIC04IC00NCAtMTYgLTQ0IC0zMCAwCi0xOCAxMiAtMTkgMjM1IC0xOSAyMjMgMCAyMzUgMSAyMzUgMTkgMCAxNCAtMTIgMjIgLTQ0IDMwIC04MCAyMCAtODYgMzYgLTg2CjI0MiBsMCAxNzkgMTY4IDAgYzE1NSAwIDE3MSAtMiAyMTggLTI0IDgyIC0zOCAxMDIgLTc2IDExNCAtMjE4IDUgLTUzIDE2Ci0xMTQgMjUgLTEzNSA1NCAtMTMwIDIwNCAtMTY1IDI5NCAtNjkgMjkgMzEgMjIgNDEgLTI3IDM4IC0yMCAtMiAtNDUgMyAtNTUKMTEgLTIzIDE2IC0zNiA3OCAtMzcgMTY4IDAgMTM2IC00NiAyMDAgLTE3NSAyNDMgLTE2IDYgLTExIDExIDMxIDM2IDEyOCA3MwoxOTYgMjE3IDE3MiAzNjUgLTIwIDEyNSAtMTE2IDIzOCAtMjM1IDI3NSAtNjEgMTkgLTkyIDIwIC00NTAgMjAgLTM0NyAwIC0zODQKLTIgLTM4MSAtMTZ6IG03NTkgLTg5IGMyNCAtMTcgNTcgLTUwIDc0IC03NCAzMCAtNDIgMzAgLTQ0IDMwIC0xNzQgMCAtMTMwIDAKLTEzMyAtMzAgLTE3NyAtMzQgLTUwIC04MSAtODUgLTEzNCAtMTAwIC0yMCAtNSAtMTA5IC0xMCAtMTk4IC0xMCBsLTE2MyAwIDAKMjg2IDAgMjg1IDE4OSAtMyAxODkgLTMgNDMgLTMweiIvPgo8cGF0aCBkPSJNNTI2MiAxNTgzIGMyIC0xMCAxOSAtMjIgMzggLTI4IDU2IC0xNiA3NyAtMzIgODkgLTY2IDcgLTIyIDExIC0xNzkKMTEgLTQ4MSAwIC01MjEgMyAtNTA0IC04MiAtNTM2IC0yOSAtMTEgLTU0IC0yNyAtNTYgLTM2IC0zIC0xNSA0MSAtMTYgNDg2Ci0xNiBsNDkwIDAgMTEgOTggYzcgNTMgMTUgMTE0IDE4IDEzNSA0IDI5IDIgMzcgLTEwIDM3IC0xMCAwIC0yMiAtMTkgLTMyIC01MAotMTkgLTU5IC01NCAtMTAzIC05OSAtMTI4IC0yNiAtMTQgLTY4IC0xNyAtMjc4IC0yMCBsLTI0OCAtNCAwIDI1MSAwIDI1MSAxOTgKMCBjMjUzIDAgMjcwIC04IDI5NyAtMTQwIDcgLTM4IDE2IC01NiAyOCAtNTggMTYgLTMgMTcgMTUgMTcgMjMyIDAgMjI1IC0xCjIzNiAtMTkgMjM2IC0xNSAwIC0yMCAtMTAgLTI2IC00OSAtOSAtNjYgLTM0IC0xMTEgLTc2IC0xMzMgLTI5IC0xNiAtNTkgLTE4Ci0yMjYgLTE4IGwtMTkzIDAgMCAyMzYgMCAyMzYgMjQ4IC00IGMyMTAgLTMgMjUyIC02IDI3OCAtMjAgNDUgLTI1IDgwIC02OSA5OQotMTI4IDEwIC0zMSAyMiAtNTAgMzIgLTUwIDEyIDAgMTQgOCAxMCAzOCAtMyAyMCAtMTEgODEgLTE4IDEzNSBsLTExIDk3IC00OTAKMCBjLTQ1OCAwIC00ODkgLTEgLTQ4NiAtMTd6Ii8+CjxwYXRoIGQ9Ik0xMjI0MCAxNTgxIGMwIC0xNCAxMCAtMjEgMzcgLTI2IDIwIC0zIDQ5IC0xOSA2NSAtMzUgbDI4IC0yOCAwCi00ODEgMCAtNDgwIC0yMiAtMjUgYy0xMyAtMTQgLTQxIC0zMiAtNjMgLTM5IC0yMiAtOCAtNDEgLTIxIC00MyAtMzAgLTMgLTE2CjM1IC0xNyA0NjcgLTE3IDI1OSAwIDQ3MSAzIDQ3MSA4IDAgNCA3IDY1IDE1IDEzNyAxOSAxNjUgMTkgMTk1IDEgMTk1IC05IDAKLTE2IC0xNyAtMjEgLTQ3IC0xMSAtNzQgLTM0IC0xMjAgLTgxIC0xNjEgLTYyIC01NiAtOTUgLTYyIC0zMTggLTYyIGwtMTk2IDAKMCA1MDEgMCA1MDEgMjggMjggYzE2IDE2IDQ1IDMyIDY1IDM1IDI3IDUgMzcgMTIgMzcgMjYgMCAxOCAtMTEgMTkgLTIzNSAxOQotMjI0IDAgLTIzNSAtMSAtMjM1IC0xOXoiLz4KPHBhdGggZD0iTTE0NzUxIDE0OTMgYy03IC02MCAtMTQgLTEyMCAtMTcgLTEzNSAtMTAgLTQ5IDIzIC0zMyA1MiAyNSAyOSA1OQo3NiAxMTIgMTE2IDEzMyAxOSAxMCA2NSAxNCAxNjMgMTQgbDEzNSAwIDAgLTQ5MiBjMCAtNDczIC0xIC00OTQgLTIwIC01MjUKLTE0IC0yNCAtMzEgLTM1IC02NSAtNDQgLTMzIC04IC00NSAtMTYgLTQ1IC0zMCAwIC0xOCAxMiAtMTkgMjM2IC0xOSAyMTQgMAoyMzUgMSAyMzIgMTcgLTIgOSAtMjEgMjIgLTQ0IDMwIC0yMyA4IC01MiAyNSAtNjUgMzkgbC0yNCAyNiAtMyA1MDAgLTMgNDk5CjE1MCAtMyAxNDkgLTMgMzkgLTMxIGMyMSAtMTcgNTQgLTYxIDczIC05NyAxOSAtMzcgNDEgLTY3IDQ4IC02NyAxNSAwIDE1IDEKLTMgMTQ1IC04IDY2IC0xNSAxMjEgLTE1IDEyMyAwIDEgLTI0MiAyIC01MzkgMiBsLTUzOCAwIC0xMiAtMTA3eiIvPgo8cGF0aCBkPSJNMTgxMjIgMTU4MyBjMiAtMTIgMjIgLTIyIDYyIC0zMSA5NyAtMjQgMTA1IC0zNyAyNTAgLTM5MyBsMTI4IC0zMTQKLTQgLTE1NyBjLTMgLTE0OSAtNCAtMTU4IC0yNyAtMTgyIC0xMyAtMTQgLTQyIC0zMSAtNjUgLTM5IC0yMyAtOCAtNDIgLTIxCi00NCAtMzAgLTMgLTE2IDE4IC0xNyAyMzIgLTE3IDIyNCAwIDIzNiAxIDIzNiAxOSAwIDE0IC0xMiAyMiAtNDQgMzAgLTMwIDcKLTUxIDIxIC02NSA0MCAtMTkgMjcgLTIxIDQzIC0yMSAxOTMgbDAgMTY1IDc2IDE4NCBjNDEgMTAxIDk1IDIzNCAxMjAgMjk0IDI0CjYxIDUzIDEyNCA2MyAxNDEgMTcgMjcgNjYgNTggMTI0IDc3IDkgNCAxNyAxMyAxNyAyMiAwIDEzIC0yMyAxNSAtMTY1IDE1Ci0xNTggMCAtMTY1IC0xIC0xNjUgLTIwIDAgLTExIDYgLTIwIDEzIC0yMCA2IDAgMjkgLTUgNDkgLTEwIDcxIC0yMCA3MCAtMjQKLTQzIC0zMDggLTEzNSAtMzQwIC0xMjIgLTMxOCAtMTQ3IC0yNTEgLTExIDMwIC01NSAxMzcgLTk3IDIzOSAtMTI0IDMwMCAtMTI0CjI5NiAtNTUgMzI0IDIyIDkgNDAgMjMgNDAgMzEgMCAxMyAtMzIgMTUgLTIzNiAxNSAtMjE3IDAgLTIzNSAtMSAtMjMyIC0xN3oiLz4KPC9nPgo8L3N2Zz4K';
  var AARI_MARK = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+CiAgPGcgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTQxMjEwIiBzdHJva2Utd2lkdGg9IjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCI+CiAgICA8IS0tIExlZnQgbGVnIC0tPgogICAgPGxpbmUgeDE9IjkiIHkxPSI1OCIgeDI9IjI5IiB5Mj0iNSIvPgogICAgPCEtLSBSaWdodCBvdXRlciBsZWcgLS0+CiAgICA8bGluZSB4MT0iMzUiIHkxPSI1IiB4Mj0iNTUiIHkyPSI1OCIvPgogICAgPCEtLSBSaWdodCBpbm5lciBsZWcgLS0+CiAgICA8bGluZSB4MT0iMzMiIHkxPSIxNCIgeDI9IjQ3IiB5Mj0iNDIiLz4KICAgIDwhLS0gVXBwZXIgY3Jvc3NiYXIgLS0+CiAgICA8bGluZSB4MT0iMjEiIHkxPSI0MiIgeDI9IjUyIiB5Mj0iNDIiLz4KICAgIDwhLS0gTG93ZXIgY3Jvc3NiYXIgLS0+CiAgICA8bGluZSB4MT0iMjUiIHkxPSI1MiIgeDI9IjQ2IiB5Mj0iNTIiLz4KICA8L2c+CiAgPCEtLSBEb3QgLS0+CiAgPGNpcmNsZSBjeD0iMTQiIGN5PSI1NiIgcj0iMi44IiBmaWxsPSIjMTQxMjEwIi8+Cjwvc3ZnPgo=';
  var FN = (window.SB_URL || client.supabaseUrl || '') + '/functions/v1';
  var KEY = window.SB_KEY || client.supabaseKey || '';

  try {

  /* Returns {token, why}. Never a bare empty string: an empty token that got
     posted anyway as "Authorization: Bearer " is how a diagnosable problem
     became the single word "unauthorized" on a compliance screen. why names the
     first thing that was missing, so the page can say it out loud. */
  function tok(){
    if (!client.auth || !client.auth.getSession)
      return Promise.resolve({ token:'', why:'client carries no auth.getSession' });
    return client.auth.getSession().then(function(r){
      var t = (r && r.data && r.data.session && r.data.session.access_token) || '';
      return { token:t, why: t ? '' : 'client is resolved and the session is empty' };
    }).catch(function(e){
      return { token:'', why:'getSession threw: ' + ((e && e.message) || e) };
    });
  }

  function post(path, token, body){
    return fetch(FN + path, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'apikey': KEY, 'Authorization': 'Bearer ' + token },
      body: JSON.stringify(body || {})
    }).then(function(r){ return r.json().then(function(j){ return { status:r.status, json:j }; }); });
  }

  var CSS = ''
    + '#aariGate{position:fixed;inset:0;z-index:2147483000;background:rgba(16,16,16,.72);display:flex;align-items:center;justify-content:center;padding:16px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif}'
    + '#aariGate *{box-sizing:border-box}'
    + '#aariGateCard{background:#fff;max-width:560px;width:100%;max-height:94vh;display:flex;flex-direction:column;border-radius:12px;box-shadow:0 24px 64px rgba(0,0,0,.34);overflow:hidden}'
    + '#aariGateCard .hd{background:#101010;color:#fff;padding:16px 20px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-shrink:0}'
    + '#aariGateCard .hd .hd-txt{flex:1;min-width:0}'
    + '#aariGateCard .hd h2{margin:0;font-family:Georgia,serif;font-size:17px;font-weight:600;line-height:1.3}'
    + '#aariGateCard .hd p{margin:5px 0 0;font-size:11px;color:#b9b5ad;letter-spacing:.5px}'
    + '#aariGateCard .hd .exit{background:none;border:1px solid rgba(255,255,255,.3);color:#fff;font-size:11px;letter-spacing:1px;text-transform:uppercase;padding:7px 12px;border-radius:5px;cursor:pointer;font-weight:600;flex-shrink:0;font-family:inherit;line-height:1}'
    + '#aariGateCard .hd .exit:hover{background:rgba(255,255,255,.1)}'
    + '#aariGateCard .bd{padding:18px 20px 20px;color:#1a1a1a;font-size:14px;line-height:1.55;overflow-y:auto;flex:1;-webkit-overflow-scrolling:touch}'
    + '#aariGateCard .ft{padding:14px 20px;border-top:1px solid #ece8dd;background:#fafaf7;flex-shrink:0}'
    + '#aariGateCard label{display:block;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#6b675f;margin:14px 0 5px}'
    + '#aariGateCard input[type=text]{width:100%;padding:11px 12px;border:1px solid #d8d4ca;border-radius:6px;font-size:16px;font-family:inherit}'
    + '#aariSigWrap{border:1px solid #d8d4ca;border-radius:6px;background:#fcfbf8;position:relative}'
    + '#aariSig{display:block;width:100%;height:140px;touch-action:none;border-radius:6px}'
    + '#aariSigHint{position:absolute;left:12px;top:56px;font-size:12px;color:#a9a49a;pointer-events:none}'
    + '#aariGateCard .row{display:flex;gap:10px;align-items:flex-start;margin-top:16px}'
    + '#aariGateCard .row input{margin-top:3px}'
    + '#aariGateCard .row span{font-size:12px;color:#4a4740;line-height:1.5}'
    + '#aariGateBtns{display:flex;gap:10px}'
    + '#aariGateBtns button{flex:1;padding:14px;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;border:1px solid #d8d4ca;background:#fff;color:#1a1a1a;font-family:inherit}'
    + '#aariGateBtns button.p{background:#101010;color:#fff;border-color:#101010}'
    + '#aariGateBtns button[disabled]{opacity:.45;cursor:not-allowed}'
    + '#aariGateMsg{margin-top:14px;font-size:13px;padding:10px 12px;border-radius:6px;display:none}'
    + '#aariGateMsg.e{display:block;background:#fdecec;color:#8a1c1c}'
    + '#aariGateMsg.o{display:block;background:#eaf6ec;color:#1c6b2e}'
    + '#aariGateCard .blocked{background:#fff8e6;border-left:3px solid #d9a520;padding:12px 14px;border-radius:4px;font-size:13px}'
    + '#aariGateCard .clr{background:none;border:none;color:#6b675f;font-size:12px;text-decoration:underline;cursor:pointer;padding:6px 10px;font-family:inherit}'
    + '#aariDocBox{margin-top:12px;border:1px solid #d8d4ca;border-radius:8px;background:#f4f2ee;overflow:hidden;min-height:140px}'
    + '#aariDocBox iframe{display:block;width:100%;height:50vh;min-height:380px;max-height:520px;border:0;background:#fff}'
    + '#aariDocLoad{padding:16px;font-size:13px;color:#6b675f;text-align:center}'
    + '#aariDocBox .derr{padding:16px;font-size:13px;color:#8a1c1c;background:#fdecec}'
    + '#aariScrollHint{display:block;width:100%;margin:14px 0 4px;padding:12px 14px;background:#faf5eb;border:1px solid #ece8dd;border-radius:6px;font-family:inherit;font-size:12.5px;font-weight:600;color:#5a5148;text-align:center;cursor:pointer;transition:background .15s,color .15s}#aariScrollHint:hover{background:#f0e6c8;color:#1a1a1a}'
    + '#aariPlanBox{margin:16px 0 4px;background:#f5f1e8;border:2px solid #d9a520;border-radius:8px;padding:16px 18px;font-size:13px;line-height:1.55;color:#2a2620}'
    + '#aariPlanBox .ptitle{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8a7f6a;font-weight:700;margin:0 0 8px}'
    + '#aariPlanBox .pname{font-size:18px;font-weight:700;color:#141210;margin:0 0 6px;font-family:Georgia,serif}'
    + '#aariPlanBox .pdetail{font-size:14px;color:#4a4740;margin:0 0 4px}'
    + '@media(max-width:640px){'
    + '#aariGate{padding:0;align-items:stretch}'
    + '#aariGateCard{max-height:100vh;max-height:100dvh;max-width:100%;height:100vh;height:100dvh;border-radius:0}'
    + '#aariGateCard .hd h2{font-size:15.5px}'
    + '#aariGateCard .bd{padding:16px 18px 20px}'
    + '#aariGateCard .ft{padding:12px 18px;padding-bottom:calc(12px + env(safe-area-inset-bottom))}'
    + '#aariDocBox iframe{height:60dvh;min-height:340px;max-height:520px}'
    + '}';

  function el(html){ var d=document.createElement('div'); d.innerHTML=html.trim(); return d.firstChild; }

  function render(st, token){
    var s=document.createElement('style'); s.textContent=CSS; document.head.appendChild(s);

    var needLicense = !st.license_set;
    var needPhone = true;
    /* The one case that stays a hard block. A first agreement is not the same
       as an update to one already signed: there is no earlier version in force
       to work under. agreement_status reports never_signed for exactly that. */
    var canDismiss = st.reason !== 'never_signed';
    var head = st.reason === 'version_update'
      ? 'Your agreement has been updated'
      : 'Sign your Independent Contractor Agreement';
    var sub = st.reason === 'version_update'
      ? 'Version ' + st.version_label + ' is now in effect. You last signed ' + (st.last_signed_version || 'an earlier version') + '. Signing the current version is required to continue.'
      : 'Version ' + st.version_label + ', effective ' + (st.effective_date || '') + '. This is required before you can use the hub.';

    if (!st.plan_set){
      var b = el('<div id="aariGate"><div id="aariGateCard">'
        + '<div class="hd"><div class="hd-txt"><h2>' + head + '</h2><p>AARI REALTY LLC</p></div><button class="exit" id="aariGateOutTop">Sign out</button></div>'
        + '<div class="bd"><div class="blocked"><b>Your commission plan has not been assigned yet.</b><br>'
        + 'Your broker must set your commission plan before you can sign. Your agreement cannot be executed without it, '
        + 'because the plan determines your split and fees on the fee schedule page.</div>'
        + '<p style="margin-top:16px;font-size:13px;color:#4a4740">Contact Marlenyi Paredes to have your plan assigned, then sign in again.</p>'
        + '</div>'
        + '<div class="ft"><div id="aariGateBtns"><button id="aariGateOut">Sign out</button></div></div>'
        + '</div></div>');
      document.body.appendChild(b);
      var out0 = function(){ try { client.auth.signOut().then(function(){ if(window.__aariExitPreview)window.__aariExitPreview();location.reload(); }); } catch(e){ if(window.__aariExitPreview)window.__aariExitPreview();location.reload(); } };
      b.querySelector('#aariGateOut').onclick = out0;
      b.querySelector('#aariGateOutTop').onclick = out0;
      return;
    }

    var g = el('<div id="aariGate"><div id="aariGateCard">'
      + '<div class="hd"><div class="hd-txt"><h2>' + head + '</h2><p>AARI REALTY LLC</p></div><button class="exit" id="aariGateOutTop">Sign out</button></div>'
      + '<div class="bd">'
      + '<p style="margin:0 0 4px">' + sub + '</p>'
      + '<div id="aariDocBox"><div id="aariDocLoad">Loading the agreement...</div></div>'
      + '<button type="button" id="aariScrollHint">Scroll down to sign &#8595;</button>'
      + (st.plan_name ? '<div id="aariPlanBox"><div class="ptitle">Your Commission Plan</div><div class="pname">' + st.plan_name + '</div><div class="pdetail">' + st.plan_split + ' commission split</div><div class="pdetail">' + st.plan_fee + ' brokerage fee</div></div>' : '')
      + (needLicense ? '<label for="aariLic">Florida real estate license number</label><input type="text" id="aariLic" autocomplete="off" placeholder="SL1234567">' : '')
      + (needPhone ? '<label for="aariPhone">Mobile number</label><input type="text" id="aariPhone" inputmode="tel" autocomplete="tel" placeholder="(239) 555-0134"><div style="font-size:11.5px;color:#8a857c;margin-top:5px">Used by your broker to reach you on transactions.</div>' : '')
      + '<label for="aariTyped">Type your full legal name</label><input type="text" id="aariTyped" autocomplete="off">'
      + '<label for="aariIni">Initials</label><input type="text" id="aariIni" maxlength="5" autocomplete="off" style="max-width:120px">'
      + '<label>Draw your signature</label>'
      + '<div id="aariSigWrap"><canvas id="aariSig"></canvas><div id="aariSigHint">Sign here</div></div>'
      + '<div style="text-align:right"><button class="clr" id="aariSigClr" type="button">Clear signature</button></div>'
      + (st.plan_name ? '<div class="row" style="margin-top:12px;background:#faf5eb;padding:10px 12px;border-radius:6px;border:1px solid #ece8dd"><input type="checkbox" id="aariPlanAck"><span style="font-weight:600">I understand I am signing onto the ' + st.plan_name + ' plan, ' + (st.plan_article || 'a') + ' ' + st.plan_split + ' commission split with a ' + (st.plan_fee_amount || st.plan_fee) + ' monthly brokerage fee.</span></div>' : '')
      + '<div class="row"><input type="checkbox" id="aariConsent"><span>I intend to electronically sign this Agreement and consent to the use of electronic records and signatures under the federal ESIGN Act and Florida’s Uniform Electronic Transactions Act, Chapter 668, Florida Statutes.</span></div>'
      + '<div id="aariGateMsg"></div>'
      + '</div>'
      + '<div class="ft"><div id="aariGateBtns">'
      + (canDismiss ? '<button id="aariGateLater">Continue to the hub</button>' : '')
      + '<button id="aariGateOut">Sign out</button><button class="p" id="aariGateGo">Sign agreement</button></div>'
      + (canDismiss ? '' : '<div class="blocked" style="margin-top:12px">This is your first Independent Contractor Agreement with Aari Realty, so it has to be signed before the hub opens. An update to an agreement you have already signed can wait. A first one cannot.</div>')
      + '</div>'
      + '</div></div>');
    document.body.appendChild(g);

    var cv=g.querySelector('#aariSig'), hint=g.querySelector('#aariSigHint');
    var ctx, drew=false;
    function fit(){
      var r=cv.getBoundingClientRect(), dpr=window.devicePixelRatio||1;
      cv.width=Math.round(r.width*dpr); cv.height=Math.round(r.height*dpr);
      ctx=cv.getContext('2d'); ctx.scale(dpr,dpr);
      ctx.lineWidth=2.1; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.strokeStyle='#101010';
    }
    fit(); window.addEventListener('resize', function(){ if(!drew) fit(); });
    var drawing=false;
    function pt(e){ var r=cv.getBoundingClientRect(); var t=e.touches?e.touches[0]:e; return {x:t.clientX-r.left, y:t.clientY-r.top}; }
    function down(e){ e.preventDefault(); drawing=true; drew=true; hint.style.display='none'; var p=pt(e); ctx.beginPath(); ctx.moveTo(p.x,p.y); }
    function move(e){ if(!drawing) return; e.preventDefault(); var p=pt(e); ctx.lineTo(p.x,p.y); ctx.stroke(); }
    function up(){ drawing=false; }
    cv.addEventListener('mousedown',down); cv.addEventListener('mousemove',move);
    window.addEventListener('mouseup',up);
    cv.addEventListener('touchstart',down,{passive:false}); cv.addEventListener('touchmove',move,{passive:false});
    cv.addEventListener('touchend',up);
    g.querySelector('#aariSigClr').onclick=function(){ ctx.clearRect(0,0,cv.width,cv.height); drew=false; hint.style.display='block'; };

    // Scroll-down hint: tap to jump to the first form field
    var scrollBtn=g.querySelector('#aariScrollHint');
    if(scrollBtn){ scrollBtn.addEventListener('click',function(){ var t=g.querySelector('label[for="aariLic"]')||g.querySelector('label[for="aariPhone"]')||g.querySelector('label[for="aariTyped"]'); if(t)t.scrollIntoView({behavior:'smooth',block:'start'}); }); }

    var msg=g.querySelector('#aariGateMsg');
    function say(t,cls){ msg.textContent=t; msg.className=cls; }

    var box=g.querySelector('#aariDocBox');
    var f=document.createElement('iframe');
    f.setAttribute('title','Independent Contractor Agreement');
    function icaDocFail(){ var l=box.querySelector('#aariDocLoad'); if(l) l.innerHTML='The agreement could not be loaded. Refresh the page, and if it still does not appear contact the broker.'; }
    /* 11 Oct 2026. This used to frame joinaari.com/ica-preview.html, a recruiting
       page carrying a coupon bar, a LIMITED TO 25 AGENTS pitch and a LOG IN link,
       wrapped around the agreement. An agent now reads the file that actually gets
       stamped and stored: the current row of realty_agreement_versions, served by a
       one hour signed URL because signed-agreements is private and stays private. */
    client.from('realty_agreement_versions').select('base_pdf_path').eq('is_current',true).limit(1)
      .then(function(r){
        var rows=(r&&r.data)||[];
        var p=rows[0]&&rows[0].base_pdf_path;
        if(!p) return null;
        return client.storage.from('signed-agreements').createSignedUrl(p,3600);
      })
      .then(function(s){
        var u=s&&s.data&&s.data.signedUrl;
        if(!u){ icaDocFail(); return; }
        f.onload=function(){ var l=box.querySelector('#aariDocLoad'); if(l) l.remove(); };
        f.src=u+'#view=FitH&toolbar=0';
      })
      .catch(function(){ icaDocFail(); });
    box.appendChild(f);
    setTimeout(function(){ var l=box.querySelector('#aariDocLoad'); if(l){ l.innerHTML='If the agreement does not appear, refresh the page.'; } },5000);

    var out = function(){ try { client.auth.signOut().then(function(){ if(window.__aariExitPreview)window.__aariExitPreview();location.reload(); }); } catch(e){ if(window.__aariExitPreview)window.__aariExitPreview();location.reload(); } };
    g.querySelector('#aariGateOut').onclick = out;
    g.querySelector('#aariGateOutTop').onclick = out;

    /* Continue is allowed only once the notice is recorded. The evidence is the
       whole reason the gate was softened, so a dismissal that could not be
       written is a dismissal that does not happen. */
    var later = g.querySelector('#aariGateLater');
    if (later) later.onclick = function(){
      later.disabled = true;
      notice('dismissed', token).then(function(r){
        if (!r || r.status !== 200 || !r.json || r.json.recorded !== true) {
          later.disabled = false;
          say('Could not record that you were shown this. Nothing was skipped. Try again, or sign now.', 'e');
          return;
        }
        g.remove();
        icaBanner(st);
      }).catch(function(e){
        later.disabled = false;
        say('Could not record that you were shown this: ' + ((e && e.message) || e), 'e');
      });
    };

    var go=g.querySelector('#aariGateGo');
    go.onclick=function(){
      var typed=(g.querySelector('#aariTyped').value||'').trim();
      var ini=(g.querySelector('#aariIni').value||'').trim();
      var lic=needLicense?((g.querySelector('#aariLic').value||'').trim()):'';
      var ph=needPhone?((g.querySelector('#aariPhone').value||'').trim()):'';
      if(needLicense && lic.length<5){ return say('Enter your Florida license number.','e'); }
      if(needPhone && ph.replace(/[^0-9]/g,'').length<10){ return say('Enter a 10 digit mobile number.','e'); }
      if(typed.length<3){ return say('Type your full legal name.','e'); }
      if(!ini){ return say('Enter your initials.','e'); }
      if(!drew){ return say('Draw your signature in the box.','e'); }
      if(st.plan_name && !g.querySelector('#aariPlanAck').checked){ return say('You must acknowledge your commission plan before signing.','e'); }
      if(!g.querySelector('#aariConsent').checked){ return say('You must consent to electronic signature.','e'); }

      go.disabled=true; say('Signing and generating your document. This can take a moment.','o');
      var dataUrl=cv.toDataURL('image/png');

      /* A fresh token, not the one captured when this card was built. This is a
         107 page agreement: reading it, typing a name, drawing a signature all
         take time, and an access token expires. The captured one was arriving at
         realty-sign-ica already dead, and the function answered with the single
         word "unauthorized", which is true and useless. */
      tok().then(function(a){
        if(!a.token){
          throw new Error('Your session expired before this could be submitted. '
            + 'Reload the page and sign in again.' + (a.why ? ' (' + a.why + ')' : ''));
        }
        var fresh = a.token;
        var pre = needLicense
          ? post('/realty-hub', fresh, { action:'set_license', license_number:lic })
          : Promise.resolve({ status:200, json:{ ok:true } });
        return pre.then(function(r){
          if(r.status!==200 || !r.json || r.json.error){ throw new Error((r.json&&r.json.error)||'Could not save your license number.'); }
          return post('/realty-sign-ica', fresh, { consent:true, plan_acknowledged:!!(st.plan_name && g.querySelector('#aariPlanAck') && g.querySelector('#aariPlanAck').checked), typed_name:typed, initials:ini, phone:ph, signature_data_url:dataUrl });
        });
      }).then(function(r){
        if(r.status!==200 || !r.json || r.json.error){ throw new Error((r.json&&(r.json.detail||r.json.error))||'Signing failed.'); }
        var card = g.querySelector('#aariGateCard');
        /* Decision 95/97, 12 Oct 2026: right after signing, an agent who still needs a
           card on file sees the save your card step here. realty-sign-ica returns
           billing_url only for an active, non exempt agent with no card saved. The
           email with the same link stays as the backup. */
        if (r.json.billing_url && /^https:\/\/joinaari\.com\/billing\.html\?t=[0-9a-f-]{36}$/.test(r.json.billing_url)) {
          card.innerHTML = '<div class="hd" style="align-items:center"><img src="' + AARI_LOGO + '" alt="Aari Realty" style="height:30px;width:auto;display:block"><p style="margin:0">ONE LAST STEP</p></div>'
            + '<div class="bd" style="position:relative;overflow:hidden;text-align:center;padding:36px 28px 40px">'
            + '<img src="' + AARI_MARK + '" alt="" aria-hidden="true" style="position:absolute;right:-40px;bottom:-40px;width:260px;height:260px;opacity:.05;pointer-events:none">'
            + '<div style="position:relative">'
            + '<div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#1c6b2e;font-weight:700;margin-bottom:12px">&#10003; Agreement signed</div>'
            + '<div style="font-family:Georgia,serif;font-size:28px;font-weight:600;color:#141210;margin-bottom:14px">One last thing.</div>'
            + '<div style="font-size:15px;color:#4a4740;line-height:1.6;max-width:400px;margin:0 auto">Your agreement is signed and your copy is already on its way to your inbox.</div>'
            + '<div style="font-size:15px;color:#4a4740;line-height:1.6;max-width:400px;margin:12px auto 0">Now save your card. <b style="color:#141210">Once.</b> Your plan fee runs on its own from there, so you never chase an invoice and we never chase you.</div>'
            + '<div style="margin:20px auto 0;max-width:300px;background:#f5f1e8;border-radius:10px;padding:12px 14px;font-size:14px;color:#141210"><b>Charged today: $0</b></div>'
            + '<div style="margin-top:22px"><a id="aariSaveCard" href="' + r.json.billing_url + '" style="display:inline-block;background:#101010;color:#fff;text-decoration:none;padding:15px 34px;border-radius:50px;font-size:13px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase">Save my card</a></div>'
            + '<div style="margin-top:14px;font-size:12px;color:#8a857c">Two minutes. This step finishes your onboarding.</div>'
            + '</div></div>';
          return;
        }
        card.innerHTML = '<div class=\"hd\"><div class=\"hd-txt\"><h2>Agreement signed</h2><p>AARI REALTY LLC</p></div></div><div class=\"bd\" style=\"text-align:center;padding:40px 30px\"><div style=\"font-size:44px;margin-bottom:16px;color:#1c6b2e\">&#10003;</div><div style=\"font-family:Georgia,serif;font-size:22px;font-weight:600;color:#141210;margin-bottom:12px\">You are all set.</div><div style=\"font-size:15px;color:#4a4740;line-height:1.6;max-width:380px;margin:0 auto\">Your Independent Contractor Agreement has been signed and a copy has been emailed to you.</div><div style=\"margin-top:24px\"><button type=\"button\" style=\"background:#101010;color:#fff;border:none;padding:14px 28px;border-radius:50px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit\" onclick=\"if(window.__aariExitPreview)window.__aariExitPreview();location.reload()\">Return to my hub</button></div></div>';
      }).catch(function(e){
        go.disabled=false;
        say(String(e&&e.message||e).slice(0,240),'e');
      });
    };
  }

  /* A gate that cannot run says so. The only quiet case is a genuinely empty
     session, which is the normal signed out page and needs no agreement check.
     Every other reason is a defect in this script, and it is written where
     somebody can read it rather than swallowed. */
  /* The notice is the evidence, so it is written before the card paints and
     again if the agent chooses to continue. Server derived: this only names the
     event, and realty-ica-notice reads the version and the signature history
     itself. A client that asserts which version it showed can assert the wrong
     one. */
  function notice(kind, token){
    return fetch(FN + '/realty-ica-notice', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'apikey': KEY, 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ event: kind })
    }).then(function(r){ return r.json().then(function(j){ return { status:r.status, json:j }; }); });
  }

  /* Persistent, and per load. No dismissed-forever flag anywhere: this bar is
     drawn fresh each time the card is dismissed, and the card itself returns on
     the next load because agreement_status still says the version is unsigned. */
  function icaBanner(st){
    if (document.getElementById('aariIcaBar')) return;
    var b = document.createElement('div');
    b.id = 'aariIcaBar';
    b.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:2147482999;'
      + 'background:#141210;color:#fff;font:500 12.5px/1.5 -apple-system,BlinkMacSystemFont,Segoe UI,Arial,sans-serif;'
      + 'padding:10px 16px;display:flex;gap:14px;align-items:center;justify-content:center;flex-wrap:wrap';
    var t = document.createElement('span');
    t.textContent = 'Your Independent Contractor Agreement, version ' + (st.version_label || '')
      + ', is not signed. You can keep working, and this stays until it is signed.';
    var a = document.createElement('button');
    a.type = 'button';
    a.textContent = 'Sign it now';
    a.style.cssText = 'background:#fff;color:#141210;border:0;border-radius:999px;'
      + 'padding:6px 14px;font:600 12px inherit;cursor:pointer';
    a.onclick = function(){ if(window.__aariExitPreview)window.__aariExitPreview();location.reload(); };
    b.appendChild(t); b.appendChild(a);
    document.body.appendChild(b);
  }

  function gateBroken(why){
    try {
      client.auth.getSession().then(function(r){
        var t = (r && r.data && r.data.session && r.data.session.access_token) || '';
        if (t) notice('gate_error', t).catch(function(){});
      }).catch(function(){});
    } catch(e) {}
  }

  function boot(){
    tok().then(function(a){
      var t = a.token;
      if(!t){
        if (a.why && a.why.indexOf('session is empty') === -1) gateBroken(a.why);
        return;
      }
      return post('/realty-hub', t, { action:'agreement_status' }).then(function(r){
        var st=r.json||{};
        if(r.status===200 && st.required===true){
          /* Recorded before the card paints, so a row exists even if the tab is
             closed straight away, and recorded on every load rather than once. */
          notice('shown', t).catch(function(){});
          render(st, t);
        }
      });
    }).catch(function(){ /* never block the hub on gate failure */ });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else setTimeout(boot,300);

  } catch(e) {
    try {
      client.auth.getSession().then(function(r){
        var t = (r && r.data && r.data.session && r.data.session.access_token) || '';
        if (t) {
          fetch(FN + '/realty-ica-notice', {
            method: 'POST',
            headers: { 'Content-Type':'application/json', 'apikey': KEY, 'Authorization': 'Bearer ' + t },
            body: JSON.stringify({ event: 'gate_error' })
          }).catch(function(){});
        }
      }).catch(function(){});
    } catch(e2) {}
  }
})();
