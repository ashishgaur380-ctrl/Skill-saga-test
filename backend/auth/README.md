# Authentication Backend

Authentication identifies the user. Authorization determines what the user may do.

## Super-admin bootstrap

The first `super_admin` assignment is a privileged server operation. It must use Firebase Admin SDK and never accept an arbitrary role assignment from the browser.

The bootstrap implementation should be run only against the Development Firebase project and should be disabled/removed after the initial administrator is provisioned.

## Custom claim

`role: super_admin`

The user document may contain profile metadata, but authorization must rely on the verified Firebase token/custom claim rather than a client-controlled profile field.
