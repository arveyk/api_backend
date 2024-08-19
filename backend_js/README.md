<h3>endpoints</h3>

<ol>
<li>login/authenticate user</li>
curl 0.0.0.0:5000/login -H "Authorization: Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=" : echo ""
<li>register/create new user</li>
curl 0.0.0.0:5000/users -xPOST -H "Content-Type: application/json" -d '{ "email": "john@wick.com", "password": "1969mustangBoss429"}' ; echo ""
<li>delete account/User<li>
<s>curl 0.0.0.0:5000/user?id=10 -XDELETE -H "Accept: application/json"
</ol>
