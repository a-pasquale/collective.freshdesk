from zope.interface import implements, Interface
from zope.component import getUtility
from Products.Five import BrowserView
from plone import api
from plone.registry.interfaces import IRegistry
from requests import session
from lxml import etree
from ZPublisher.HTTPRequest import FileUpload
import hashlib
#from poster.encode import multipart_encode


from collective.freshdesk import freshdeskMessageFactory as _


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

    def getTickets(self):
        params = ''
        files = {}
        partial = False
        result = {}

        form = self.request.form
        if "ticket" in form:
            params = form['ticket'];
            if "partial" in form:
                partial = True

        wf_order = self.request.cookies.get('wf_order', 'updated_at')
        wf_order_type = self.request.cookies.get('wf_order_type', 'asc')
        cookies = {'wf_order': wf_order, 'wf_order_type': wf_order_type} 
        headers = {'content-type': 'multipart/form-data'}
        # Monkeypatch FileUpload class
        FileUpload.__len__ = self.__len__
            
        registry = getUtility(IRegistry)
        freshdesk_domain_name = registry['collective.freshdesk.domain_name']
        freshdesk_sso_secret = registry['collective.freshdesk.sso_secret']

        current = api.user.get_current()
        name = current.getProperty('fullname')
        email = current.getProperty('email')
        h = gen_hash_from_params(name, email, freshdesk_sso_secret)
        login_url = "%slogin/sso?name=%s&email=%s&hash=%s" % (freshdesk_domain_name, name, email, h)
        with session() as c:
            r = c.post(login_url, allow_redirects=True)
            # -- FIX THIS --
            #
            # File uploading is currently broken.
            # HTML controls are hidden to prevent users from attempting uploads.
            #
            #if "helpdesk_note[attachments][][resource]" in form:
                #file = form["helpdesk_note[attachments][][resource]"]
                #file.__len__ = self.__len__
                #if isinstance(file,FileUpload) and len(file.filename) > 0:
                    #files = {'helpdesk_note[attachments][][resource]': file }
                    #form["helpdesk_note[attachments][][resource]"] = ''
                    #form["emptyfile"] = ''
                        #datagen, headers = multipart_encode({"helpdesk_note[attachments][][resource]": file})
                        #payload.update(datagen)

            url = "%ssupport/tickets/%s" % (freshdesk_domain_name, params)
            if "company_tickets" in params:
                url = "%ssupport/%s" % (freshdesk_domain_name, params)
                    
            if len(form) > 3:
                r = c.post(url, data=form, headers=headers, files=files, cookies=cookies)
            else: 
                r = c.get(url, data=form, cookies=cookies)

            if partial:
                # This is a request to filter the tickets.
                self.request.response.setHeader("Content-type","application/javascript")
                result = {'partial': partial, 'text': r.text}
            else:
                # All other requests get parsed.
                html = etree.HTML(r.text)
                # Get the list of tickets
                x = html.xpath("//*[@id='ticket-list']")
                if len(x) > 0:
                    ticketList = etree.tostring(x[0])
                else:
                    ticketList= ''
                # This is the menu that allows you to choose
                # between all, open, or resolved tickets.
                x = html.xpath("//*[@id='all-views']")
                if len(x) > 0:
                    all_views = etree.tostring(x[0])
                    all_views = all_views.replace("support", "helpdesk")
                    all_views = all_views.replace("company_tickets", "tickets/company_tickets")
                else:
                    all_views = ''
                # This content is used to display individual tickets.
                x = html.xpath("//*[@id='Pagearea']")
                if len(x) > 0:
                    pageArea = etree.tostring(x[0])
                else:
                    pageArea= ''

                result = {'pageArea': pageArea,
                          'ticketList': ticketList,
                          'partial': partial,
                          'all_views': all_views}

            return result

