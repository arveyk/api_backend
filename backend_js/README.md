<h3>API Endpoints</h3>

<ol>

<li><b>Login/Authenticate user</b></li>
user0:~$ curl 0.0.0.0:5000/login -H "Authorization: Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=" : echo ""

user0:~$ curl 0.0.0.0:5000/users/me -H "X-Token: 031bffac-3edc-4e51-aaae-1c121317da8a" ; echo ""
{"id":"5f1e7cda04a394508232559d","email":"bob@dylan.com"}

<li><b>Register/Create new user</b></li>
user0:~$curl 0.0.0.0:5000/users -xPOST -H "Content-Type: application/json" -d '{ "email": "john@wick.com", "password": "1969mustangBoss429"}' ; echo ""

<li><b>Delete account/User</b><li>
<s> 
user0:~$ curl 0.0.0.0:5000/user?id=10 -XDELETE -H "Accept: application/json"
<li><b>Post files /files</b><li>
<li><b>Get files /files/:id</b><li>
<li><b>Get files /files</b><li>


<li><b>Put files /files/:id/publish</b><li>
<li><b>Put files /files/:id/unpublish:</b><li>
<li><b>Get files /files/:id/data</b><li>
</ol>
