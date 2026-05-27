workspace "Event Manager" "Monorepo para la plataforma de gestion de eventos de Jala University." {

    model {
        user = person "Usuario Final" "Un estudiante o miembro de Jala University que busca asistir a eventos."
        admin = person "Administrador" "Un administrador de la plataforma que gestiona los eventos, etiquetas y usuarios."
        
        emailSystem = softwareSystem "Sistema de Correo" "Servicio externo de Resend para el envio de notificaciones y confirmaciones." "External"
        oauthProvider = softwareSystem "Proveedor de OAuth" "Servicios de autenticacion externa de Google y Microsoft." "External"
        
        eventManagerSystem = softwareSystem "Event Manager System" "El sistema central de gestion de eventos, que permite ver, registrarse y administrar eventos." {
            
            singlePageApplication = container "SPA Angular" "Aplicacion web cliente desarrollada con Angular v21, utilizando señales y arquitectura limpia." "Angular" "WebBrowser"
            apiApplication = container "NestJS API" "El servidor del backend que provee la logica de negocio y endpoints RESTful." "NestJS / TypeScript"
            database = container "Base de Datos" "Base de datos relacional para persistir los usuarios, eventos, tags y registros." "PostgreSQL (Prisma)" "Database"
        }

        # Relaciones del Contexto
        user -> eventManagerSystem "Visualiza eventos y se registra en ellos"
        admin -> eventManagerSystem "Crea y administra eventos, usuarios y etiquetas"
        eventManagerSystem -> emailSystem "Envia notificaciones de correo electronico a los usuarios"
        eventManagerSystem -> oauthProvider "Autentica usuarios usando credenciales institucionales"

        # Relaciones de Contenedores
        user -> singlePageApplication "Visualiza e interactua en el navegador"
        admin -> singlePageApplication "Administra los paneles del Dashboard"
        singlePageApplication -> apiApplication "Realiza peticiones HTTP API" "JSON/HTTPS"
        apiApplication -> database "Lee y escribe datos utilizando Prisma Client" "SQL/TCP"
        apiApplication -> oauthProvider "Valida tokens de autenticacion" "HTTPS"
        apiApplication -> emailSystem "Envia peticiones de envio de correos" "HTTPS"
    }

    views {
        systemContext eventManagerSystem "SystemContext" "Diagrama de Contexto del Sistema Event Manager" {
            include *
            autoLayout lr
        }

        container eventManagerSystem "Containers" "Diagrama de Contenedores del Sistema Event Manager" {
            include *
            autoLayout tb
        }

        styles {
            element "Element" {
                color #ffffff
            }
            element "Person" {
                background #08427b
                shape Person
            }
            element "Software System" {
                background #1168bd
            }
            element "Container" {
                background #438dd5
            }
            element "Database" {
                shape Cylinder
                background #85bbf0
                color #000000
            }
            element "External" {
                background #999999
            }
            element "WebBrowser" {
                shape WebBrowser
            }
        }
    }
}
