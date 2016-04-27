# F5 APM Session Information Chrome Extension

The point of this project was to create a Chrome extension that will show useful information about an APM session, including the decoded url and/or the APM cookie information.

Example:

* When accessing a url like `https://www.example.com/f5-w-68747470733A2F2F6D79736974652E696E7465726E616C2E6C6F63616C$$/index.html`, the extension will be enabled and clicking on the icon will display a popup that show the decoded information (i.e. that the internal url will be `https://mysite.internal.local/index.html`). 
* When accessing a url like https://www.example.com/ that uses an APM access profile and there's an MRHSession cookie, the extension will list the known cookies available for that url.

# Installation instructions
Currently, this extension is not in the Chrome App Store, but you can sideload it into Chrome.

* Navigate to `chrome://extensions`
* Ensure that the `Developer mode` checkbox is enabled
* Sub-Method 1: Load unpacked extension
  * Click the `Load unpacked extension` button and select the folder that contains the source
* Sub-Method 2: Load the *crx* file
  * From the file system, click and drag the `.crx` file onto the extension page to begin the installation.

Once you have completed the installation, you will notice the icon grayed somewhere beside the address bar. The icon is only enabled on sites whose url address contain `f5-w-` (denoting an APM encoded url) or where there's an MRHSession cookie.

# Version History
* 1.1 - Initial version
  * Includes APM portal access decoded url information
* 1.2 - 2016.04.01
  * Added list of cookies associated with the current site (shows cookie name, domain and value)
* 1.3 - 2016.04.25
  * Added ability to delete cookies from the extension for the site (Known Issue: if you have multiple cookies with the same name that match the page, deleting one will delete all of them)
  * Added decoded BIG-IP persistence cookie value in parenthesis to the list for quicker reference
  
  
**NOTE: Sorry for the ugly logo. I didn't want to reuse the F5 logo. If anyone would like to create a logo, please do. It would be greatly appreciated.**