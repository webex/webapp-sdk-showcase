# Get Started
###
## 1. Install a web server
You could download and install any web server you prefer like Apache, XAMPP etc.
We recommend to use [XAMPP](https://www.apachefriends.org/index.html) since it is easy to install and use

## 2. Link the content under PanTool to some folder under 'htdocs' of your web server
Example:
```
ln -s /Users/beshe/workspace/webapp-sdk-showcase /Applications/XAMPP/htdocs/showcase
```
Or you can do 'git clone' just under '/Applications/XAMPP/htdocs' to pull this repo.

## 3. Change your host file.
Add a fake domain with the suffix of '.webex.com' in your host file, like:
```
127.0.0.1	beshe.webex.com
```
or
```
127.0.0.1	beshe.webex.com.cn
```
## 4. Visit the demo page
Navigate to the fake URL in your browser, like:
```
https://beshe.webex.com/showcase/PanTool/panTool.html
```
The URL value is based on your previous setting

## 5. Join meeting
### ***(Note: You need to start a meeting by regular Webex Meetig client before this step.)***
Enter the URL where your meeting was started, like: 
```
https://skytech-dev.webex.com.cn
```
Enter the 9-digit meeting number.
Enter your email and username.
Click 'Join Meeting' button.
Then you should join the meeting and get audio/video(receiving) connected.




