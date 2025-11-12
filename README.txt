## Repositorio backend (API en flask): https://github.com/Manug0mez33/EFI-python-ITEC

## Guia de instalacion y ejecucion del proyecto

    -   Paso previo: Tener instalado Node.js y npm
    1 - git clone git@github.com:Manug0mez33/EFI-React.git
    2 - cd EFI-React
    3 - npm install
    4 - npm run dev

## Comentarios

        - El nombre de nuestro blog es Posteo Diario. Adaptamos casi al 100% nuestro front a nuestra API de flask.
        - Cada metodo que definimos en nuestras APIs en el backend, esta adaptado a nuestro front, excepto por la API que utiliza un refresh token para actualizar el access token ya que solo dura 15 minutos. No hicimos esta adaptacion porque quisimos implementarla al ultimo, luego de tener los componentes ya creados, y habia que cambiar todos nuestros fetch en los mismos, por lo que decidimos no implementarla. - En la consigna se solicitaba CRUDs solo para Posts y Reviews(Comentarios), pero decidimos agregar Users, Categories y Stats, ya que asi lo teniamos en nuestra API. 
        - Usamos las plantillas de AuthContext, LoginForm y RegisterForm que creamos previamente en clase, con algunos ligeros cambios, como por ejemplo, cuando un usuario se registre, se logee automaticamente y se lo redireccione a la pagina principal donde podra ver los posts y comentarios.
        - Nuestro repositorio EFI-python-ITEC, donde tenemos nuestra API, contiene un archivo README.txt con las instrucciones de instalacion y ejecucion del proyecto, con comandos claves para la creacion de la base de datos y usuarios de cada rol, para lograr una correcta adaptacion a nuestro front.

## Integrantes: 

    - Juan Falco - https://github.com/juansenf
    - Manuel Gomez - https://github.com/Manug0mez33

## Estamos a disposicion ante cualquier duda, saludos!