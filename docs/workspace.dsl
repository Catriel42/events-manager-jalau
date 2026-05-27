workspace "Event Manager" "Monorepo for the Jala University event management platform." {

    model {
        user = person "End User" "A student or Jala University member looking to attend events."
        admin = person "Administrator" "A platform administrator who manages events, tags, and users."
        
        emailSystem = softwareSystem "Email System" "External Resend service for sending notifications and confirmations." "External"
        oauthProvider = softwareSystem "OAuth Provider" "External Google and Microsoft authentication services." "External"
        
        eventManagerSystem = softwareSystem "Event Manager System" "The core system for managing events, allowing viewing, registration, and administration." {
            
            singlePageApplication = container "Angular SPA" "Client web application built with Angular v21 using signals and clean architecture." "Angular" "WebBrowser"
            apiApplication = container "NestJS API" "The backend server providing business logic and RESTful endpoints." "NestJS / TypeScript"
            database = container "Database" "Relational database to persist users, events, tags, and registrations." "PostgreSQL (Prisma)" "Database"
        }

        # Context Relationships
        user -> eventManagerSystem "Views events and registers for them"
        admin -> eventManagerSystem "Creates and manages events, users, and tags"
        eventManagerSystem -> emailSystem "Sends email notifications to users"
        eventManagerSystem -> oauthProvider "Authenticates users using institutional credentials"

        # Container Relationships
        user -> singlePageApplication "Views and interacts within the web browser"
        admin -> singlePageApplication "Manages dashboard panels"
        singlePageApplication -> apiApplication "Makes HTTP API requests" "JSON/HTTPS"
        apiApplication -> database "Reads from and writes to using Prisma Client" "SQL/TCP"
        apiApplication -> oauthProvider "Validates authentication tokens" "HTTPS"
        apiApplication -> emailSystem "Sends email delivery requests" "HTTPS"
    }

    views {
        systemContext eventManagerSystem "SystemContext" "System Context diagram for the Event Manager System" {
            include *
            autoLayout lr
        }

        container eventManagerSystem "Containers" "Container diagram for the Event Manager System" {
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
