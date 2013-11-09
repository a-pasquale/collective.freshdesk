from zope.interface import implements, Interface
from zope.component import getUtility
from Products.Five import BrowserView
from plone import api
from plone.registry.interfaces import IRegistry
import hashlib
from collective.freshdesk import freshdeskMessageFactory as _

FRESHDESK_JS = """
<script>
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        //search = /([^&=]+)=?([^&]*)/g,
        search = /(\d+)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        //query  = window.location.search.substring(1),
        query = window.location,
        urlParams = {};

    while (match = search.exec(query)) {
        //urlParams[decode(match[1])] = decode(match[2]);
        console.log(match[1]);
        urlParams['ticket'] = decode(match[1]);}

    function getTickets() {
        $.ajax({
            url: '%(url)s',
            dataType: 'script',
            success: function() {
                var ticket_url = 'https://healthlens.freshdesk.com/support/tickets';
                if (urlParams["ticket"]) {
                    ticket_url += "/" + urlParams["ticket"];
                }
                jQuery('#tickets').attr('src', ticket_url);
            },
        });
    }

    jQuery(document).ready( function() {
        getTickets();               
    });
</script>
"""


class IFreshdeskView(Interface):
    """
    Freshdesk view interface
    """

    
def gen_hash_from_params(name, email, secret):
    m = hashlib.md5()
    m.update("%s%s%s" % (name, email, secret))
    return m.hexdigest()


class FreshdeskView(BrowserView):
    """
    Freshdesk browser view
    """
    implements(IFreshdeskView)

    def __init__(self, context, request):
        self.context = context
        self.request = request

    def __len__(self): return 1

    def getLink(self):
        registry = getUtility(IRegistry)
        freshdesk_domain_name = registry['collective.freshdesk.domain_name']
        freshdesk_sso_secret = registry['collective.freshdesk.sso_secret']
        current = api.user.get_current()
        name = current.getProperty('fullname')
        email = current.getProperty('email')
        h = gen_hash_from_params(name, email, freshdesk_sso_secret)
        login_url = "%s/login/sso?name=%s&email=%s&hash=%s" % (freshdesk_domain_name,name,email,h)
        return login_url

    def getScript(self):
        login_url = self.getLink()
        return FRESHDESK_JS % {'url': login_url}

