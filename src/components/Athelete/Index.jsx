import React, { Component } from "react";
import { Grid, Row, Col, Table, Button, Image, Dropdown } from "react-bootstrap";
import Card from "components/Card/Card.jsx";
import avatar from "../../assets/img/athlete.png";
import AtheleteModal from "components/Modals/Athelete/Index";
import axios from "axios";
import config from "../../config";
import { Redirect } from "react-router";
import Pagination from "react-js-pagination";
import EPagination from "components/common/EPagination";
import Auth from "components/Services/Auth";
import { confirmAlert } from "react-confirm-alert";
import AthleteConfirmation from "components/common/AthleteConfirmation";
import { toast } from "react-toastify";

class Athelete extends Component {
	state = {
		isAddModalOpen: false,
		data: [],
		selection: "",
		id: "",
		activePage: 1,
		totalItems: "",
		showSearch: false,
		showSearchButton: true,
		d_athlete: "",
		new_Ath_id:"",
		drills_data: ""
	};

	handlePageChange = (pageNumber) => {
		const token = localStorage.getItem("token");
		axios
			.get(`${config.API_URL}/admin/athlete/?page=${pageNumber}`, {
				headers: {
					Authorization: token,
				},
			})
			.then((response) => {
				this.setState({
					activePage: pageNumber,
					data: response.data.data.athlete,
				});
			});
	};

	getAllData = () => {
		const token = localStorage.getItem("token");
		axios
			.get(`${config.API_URL}/admin/athlete`, {
				headers: {
					Authorization: token,
				},
			})
			.then((response) => {
				this.setState({
					totalItems: response.data.count,
				});
			});
		this.handlePageChange(this.state.activePage);
	};

	componentDidMount() {
		this.getAllData();
	}
	handleDelete = (id) => {
		const token = localStorage.getItem("token");
		
		axios.get(`${config.API_URL}/admin/drills_athlete/${id}`, {
				headers: {
					Authorization: token,
				},
			})
			.then((response) => {
			
				this.setState({
					d_athlete: response.data.data.drills_count,
					drills_data: response.data.data.drills,
				});


				confirmAlert({
					customUI: ({ onClose }) => {
						return <AthleteConfirmation onDelete={this.deleteAction} onDeleteAll={this.onDeleteAllAction} onMove={this.moveAction} data = {this.state.data} videosCount={this.state.d_athlete} onChangeData= {this.onChangeData}   onClose={onClose} id={id} />;
					},
				});
			});
			
	};
	deleteAction = (id) => {
		const token = localStorage.getItem("token");
		axios
			.delete(`${config.API_URL}/admin/athlete/${id}`, {
				headers: {
					Authorization: token,
				},
			})
			.then((response) => {
				const newdata = this.state.data.filter((i) => {
					return i._id !== id;
				});
				toast.success("Athlete has been deleted successfully.");
				this.setState({
					data: newdata,
					totalItems: response.data.data.count,
				});
			});
	};

	onDeleteAllAction = (id) => {
		const drill_docs = this.state.drills_data; 
		
		drill_docs.forEach(element => {

			this.handleSingledrillsDelete(element.drill_id);
		});

		this.deleteAction(id);
		
		
	};

	handleSingledrillsDelete(id){
		axios
		.delete(`${config.API_URL}/admin/drills/${id}`, {
			headers: {
				Authorization: Auth.getToken(),
			},
		})
		.then((response) => {
			toast.success("Drill has been deleted successfully.");
		})
		.catch((error) => console.log(error));
	}

	onChangeData = (catdata) => {
		this.setState({
			new_Ath_id: catdata
		});


	};



	moveAction = (current, NewAth) => {

		const dataAthDrill={
			currentAth_Id: current,
			newAth_id: NewAth 
		}


		const token = localStorage.getItem("token");

		axios.post(`${config.API_URL}/admin/drills_ath_move`, dataAthDrill, {
			headers: {
				Authorization: token,
			},
		})
		.then((response) => {
			if(response.data.data.drills === "Moved")
			{
				this.deleteAction(current);
			}
		});


	};

	handleToggleAtheleteModal = (edit, id) => {
		this.setState({
			isAddModalOpen: !this.state.isAddModalOpen,
			selection: edit,
			id: id,
		});
	};

	toggleSearch = () => {
		const { showSearch,showSearchButton } = this.state;
		this.setState({
			showSearch: !showSearch,
			showSearchButton: !showSearchButton,
		});
	};

	handleSearch = (e) => {
		let search = e.currentTarget.value;
		axios
			.get(`${config.API_URL}/admin/athlete/?search=${search}`, {
				headers: {
					Authorization: Auth.getToken(),
				},
			})
			.then((response) => {
				this.setState({
					data: response.data.data.athlete,
				});
			});
	};

	render() {
		const token = localStorage.getItem("token");
		if (!token) {
			return <Redirect to='/login' />;
		}
		const { isAddModalOpen, showSearch,showSearchButton } = this.state;
		const data = this.state.data;
		const showSearchClass = showSearch ? "block" : "none";
		const showSearchButtonClass = showSearchButton ? "block" : "none";


		return (
			<Grid fluid>
				<Row style={{ margin: "10px 0 10px 0" }}>
					<Col md={10}>
						<input  onBlur={this.toggleSearch} className='search-bar' placeholder='Search...' style={{ display: showSearchClass }} onChange={this.handleSearch} />
						<Button className='search-btn' style={{ display: showSearchButtonClass}} onClick={this.toggleSearch}>
							<i className='pe-7s-search'></i>
						</Button>
					</Col>

					

					<Col md={2}>
						<Button className='btn-dark pull-right m-2'  onClick={() => this.handleToggleAtheleteModal("add")}>
							Add Athlete
						</Button>
					</Col>
				</Row>
				<Row>
					<Col md={12}>
						<Card
							content={
								<Table striped hover>
									<thead>
										<tr>
											<th>Id</th>
											<th>Image</th>
											<th>Name</th>
											<th>Action</th>
										</tr>
									</thead>
									<tbody>
										{data.map((athelete, i) => {
											return (
												<tr key={i}>
													<td>{i + 1}</td>
													<td>
													{(athelete.imageURL === undefined || athelete.imageURL === "null") ? (
															<Image src={avatar} style={{ width: "50px",borderRadius:"50%" }} roundedCircle />
														) : (
															<Image src={athelete.imageURL} style={{ width: "50px",borderRadius:"50%" }} roundedCircle onError={(e)=>{e.target.src=avatar}}/>
														)
														}
													</td>
													<td>{athelete.name}</td>
													<td>
														<Dropdown>
															<Dropdown.Toggle variant='success' id='dropdown-basic'></Dropdown.Toggle>

															<Dropdown.Menu>
																<li className='dropdown-item'>
																	<a onClick={() => this.handleToggleAtheleteModal("view", athelete._id)}>View</a>
																</li>
																<li className='dropdown-item'>
																	<a onClick={() => this.handleToggleAtheleteModal("edit", athelete._id)}>Edit</a>
																</li>
																<li className='dropdown-item'>
																	<a onClick={() => this.handleDelete(athelete._id)}>Delete</a>
																</li>
															</Dropdown.Menu>
														</Dropdown>
													</td>
												</tr>
											);
										})}
									</tbody>
								</Table>
							}
						/>
					</Col>
				</Row>
				<Row>
					<Col md={12} style={{ textAlign: "center" }}>
						<EPagination
							activePage={this.state.activePage}
							itemsCountPerPage={10}
							totalItemsCount={this.state.totalItems}
							pageRangeDisplayed={5}
							handlePageChange={this.handlePageChange.bind(this)}
							items={this.state.data}
						/>
					</Col>
				</Row>

				{isAddModalOpen ? (
					<AtheleteModal
						getAllData={this.getAllData}
						selection={this.state.selection}
						id={this.state.id}
						onClose={this.handleToggleAtheleteModal}
						isAddModalOpen={isAddModalOpen}
					/>
				) : (
					""
				)}
			</Grid>
		);
	}
}

export default Athelete;
