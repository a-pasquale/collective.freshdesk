from zope.interface import implements, Interface
from zope.component import getUtility
from Products.Five import BrowserView
from plone import api
from plone.registry.interfaces import IRegistry
from requests import session
from lxml import etree
from ZPublisher.HTTPRequest import FileUpload
import hashlib


from collective.freshdesk import freshdeskMessageFactory as _


class IFreshdeskSearch(Interface):
    """
    Freshdesk Search interface
    """

    
def gen_hash_from_params(name, email, secret):
    m = hashlib.md5()
    m.update("%s%s%s" % (name, email, secret))
    return m.hexdigest()


class FreshdeskSearch(BrowserView):
    """
    Freshdesk browser view
    """
    implements(IFreshdeskSearch)

    def __init__(self, context, request):
        self.context = context
        self.request = request

    def __call__(self):
        registry = getUtility(IRegistry)
        freshdesk_domain_name = registry['collective.freshdesk.domain_name']
        freshdesk_sso_secret = registry['collective.freshdesk.sso_secret']

        current = api.user.get_current()
        name = current.getProperty('fullname')
        email = current.getProperty('email')
        h = gen_hash_from_params(name, email, freshdesk_sso_secret)
        login_url = "%slogin/sso?name=%s&email=%s&hash=%s" % (freshdesk_domain_name, name, email, h)

        form = self.request.form

        result = {}
        with session() as c:
            c.post(login_url, allow_redirects=True)
            import logging
            logger = logging.getLogger("freshdesk")
            url = "%ssearch/suggest?search_key=%s" % (freshdesk_domain_name, form['search_key'])
            logger.info(url)
            self.request.response.setHeader("Content-type","application/javascript")
            r = c.get(url, data=form)
            logger.info(t.text)
            result = r.text

        return result

