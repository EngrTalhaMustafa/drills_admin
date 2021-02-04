import React from "react";
import ReactDOM from "react-dom";

import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/css/animate.min.css";
import "./assets/sass/light-bootstrap-dashboard-react.scss?v=1.3.0";
import "./assets/css/demo.css";
import "./assets/css/pe-icon-7-stroke.css";
import "react-toastify/dist/ReactToastify.css";
import "./assets/css/custom.css";
import "./assets/css/custom2.css";
import "./assets/css/media.css";

import AdminLayout from "layouts/Admin.jsx";
import LoginLayout from "layouts/Login";

ReactDOM.render(
	<BrowserRouter>
		<Switch>
			<Route path='/login' component={LoginLayout}></Route>
			<Route path='/admin/dashboard' render={(props) => <AdminLayout {...props} />} />
			<Route path='/admin/users' render={(props) => <AdminLayout {...props} />} />
			<Route path='/admin/categories' render={(props) => <AdminLayout {...props} />} />
			<Route path='/admin/atheletes' render={(props) => <AdminLayout {...props} />} />
			<Route path='/admin/difficulty-levels' render={(props) => <AdminLayout {...props} />} />
			<Route path='/admin/speed-levels' render={(props) => <AdminLayout {...props} />} />
			<Route path='/admin/drills' render={(props) => <AdminLayout {...props} />} />
			<Route path='/admin/playlist' render={(props) => <AdminLayout {...props} />} />
			<Route path='/admin/subscriptions' render={(props) => <AdminLayout {...props} />} />
			{/* <Route path='/admin' render={(props) => <AdminLayout {...props} />} /> */}
			<Redirect from='/' to='/admin/dashboard' />
		</Switch>
	</BrowserRouter>,
	document.getElementById("root")
);



