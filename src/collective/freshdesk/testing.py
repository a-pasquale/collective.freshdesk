from plone.app.testing import PloneWithPackageLayer
from plone.app.testing import IntegrationTesting
from plone.app.testing import FunctionalTesting

import collective.freshdesk


COLLECTIVE_FRESHDESK = PloneWithPackageLayer(
    zcml_package=collective.freshdesk,
    zcml_filename='testing.zcml',
    gs_profile_id='collective.freshdesk:testing',
    name="COLLECTIVE_FRESHDESK")

COLLECTIVE_FRESHDESK_INTEGRATION = IntegrationTesting(
    bases=(COLLECTIVE_FRESHDESK, ),
    name="COLLECTIVE_FRESHDESK_INTEGRATION")

COLLECTIVE_FRESHDESK_FUNCTIONAL = FunctionalTesting(
    bases=(COLLECTIVE_FRESHDESK, ),
    name="COLLECTIVE_FRESHDESK_FUNCTIONAL")
