Introduction
============

This is a product to integrate Freshdesk ticket management into Plone.  

Usage
-----
To apply this BrowserView go to the url /support/helpdesk/tickets/manage_propertiesForm and add the property "layout" with the value "freshdesk_view".

This product is dependent on the requests HTTP library.  Use the version from git://github.com/kennethreitz/requests.git since versions on pyPi have a bug in the sessions handling code.

Add this to the nginx configuration:
server {

    location /helpdesk/tickets/ {                                                                    
        rewrite /helpdesk/tickets/(.*) /helpdesk/tickets?ticket=$1;
    }

    location /support/tickets/ {
        rewrite /support/tickets/(.*) /helpdesk/tickets?ticket=$1;
    }

    location /search/suggest/ {
        rewrite /search/suggest(.*) /@@freshdesk_search$1;
    }

    location /javascripts {                
        rewrite             /(.*) /$1 break;
        proxy_pass          http://beta.helpdesk.healthlens.org/;
        proxy_set_header    Host        beta.helpdesk.healthlens.org;
        proxy_set_header    X-Real-IP   $remote_addr;               
        proxy_set_header    X-Forwarded-For     $remote_addr;
        proxy_set_header    X-Originating-IP    $remote_addr;
        proxy_set_header    HTTP_REMOTE_ADDR    $remote_addr;
        proxy_set_header    REMOTE_ADDR         $remote_addr;
    }

    location /packages {                
        rewrite             /(.*) /$1 break;
        proxy_pass          http://beta.helpdesk.healthlens.org/;
        proxy_set_header    Host        beta.helpdesk.healthlens.org;
        proxy_set_header    X-Real-IP   $remote_addr;               
        proxy_set_header    X-Forwarded-For     $remote_addr;
        proxy_set_header    X-Originating-IP    $remote_addr;
        proxy_set_header    HTTP_REMOTE_ADDR    $remote_addr;
        proxy_set_header    REMOTE_ADDR         $remote_addr;
    }
}
