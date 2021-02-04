import React, { Component } from "react";
import { Grid, Row, Col, Table, Button, Image, Dropdown } from "react-bootstrap";
import Card from "components/Card/Card.jsx";
import avatar from "../../assets/img/uploadImg.png";
import DrillModal from "components/Modals/Drill/Index";
import axios from "axios";
import config from "../../config";
import { Redirect } from "react-router";
import Pagination from "react-js-pagination";
import EditDrillModal from "components/Modals/Drill/Edit";
import EPagination from "components/common/EPagination";
import { Link } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";
import Confirmation from "components/common/Confirmation";
import Auth from "components/Services/Auth";
import { toast } from "react-toastify";
import PlaylistDrillModel from "components/Modals/Playlist/PlaylistDrill"

class Drill extends Component {
	state = {
		isAddModalOpen: false,
		isEditModalOpen: false,
		isPlaylistModalOpen: false,
		drillNeedToBeEdit: "",
		data: [],
		selection: "",
		id: "",
		activePage: 1,
		totalItems: "",
		selection:"",
		showSearch: false,
		showSearchButton: true,
		drillNeedToBeAddedToPlaylist:"",
	};

	handleToggleDrillModal = () => {
		this.setState({
			isAddModalOpen: !this.state.isAddModalOpen,
			isPlaylistModalOpen: false,
			isEditModalOpen: false
		});
	};

	handleToggleEditDrillModal = (edit,drillId) => {
		this.setState({
			isEditModalOpen: !this.state.isEditModalOpen,
			drillNeedToBeEdit: drillId,
			selection:edit,
			isPlaylistModalOpen: false,
			isAddModalOpen: false
		});
	};

	handlePageChange = (pageNumber) => {
		const token = localStorage.getItem("token");
		axios
			.get(`${config.API_URL}/admin/drills/?page=${pageNumber}`, {
				headers: {
					Authorization: token,
				},
			})
			.then((response) => {

				this.setState({
					activePage: pageNumber,
					data: response.data.data.drills,
				});
			});
	};
	getAllData = () => {
		const token = localStorage.getItem("token");
		axios.get(`${config.API_URL}/admin/drills`, {
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
		const token = localStorage.getItem("token");
		axios
			.get(`${config.API_URL}/admin/drills`, {
				headers: {
					Authorization: token,
				},
			})
			.then((response) => {
				this.setState({
					totalItems: response.data.count,
				});
			});
		this.handlePageChange(1);
	}

	handleDeleteDrill = (drillId) => {
		this.setState({
			isPlaylistModalOpen: false,
			isEditModalOpen:false,
			isAddModalOpen:false
		})
		confirmAlert({
			customUI: ({ onClose }) => {
				return <Confirmation onDelete={this.deleteAction} onClose={onClose} id={drillId} />;
			},
		});
	};

	deleteAction = (id) => {
		axios
			.delete(`${config.API_URL}/admin/drills/${id}`, {
				headers: {
					Authorization: Auth.getToken(),
				},
			})
			.then((response) => {
				const newdata = this.state.data.filter((i) => {
					return i._id !== id;
				});
				this.setState({
					data: newdata,
					totalItems: response.data.data.count,
				});
				toast.success("Drill has been deleted successfully.");
			})
			.catch((error) => console.log(error));
	};

	handleSearch = (e) => {
		let search = e.currentTarget.value;
		axios.get(`${config.API_URL}/admin/drills/?search=${search}`, {
			headers: {
				Authorization: Auth.getToken(),
			},
		}).then((response) => {
			this.setState({
				data: [...response.data.data.drills],
			});
		});
	};

	toggleSearch = () => {
		const { showSearch,showSearchButton } = this.state;
		this.setState({
			showSearch: !showSearch,
			showSearchButton: !showSearchButton,
		});
	};

	handleAddDrill = () => {
		this.setState({
			isAddModalOpen: false,
		});
		this.getAllData();
	};

	handleEditDrill = () => {
		this.setState({
			isEditModalOpen: false,
		});
		this.getAllData();
	};


	handleToggleDrillPlaylistModal = (drillId,name) =>{
		
		const drillData = {
			drillID: drillId,
			drillName: name
		}

		this.setState({
			isPlaylistModalOpen: !this.state.isPlaylistModalOpen,
			drillNeedToBeAddedToPlaylist: drillData,
			isEditModalOpen: false,
			isAddModalOpen:false
		});
	}

	handleDrillPlaylistModal = () =>{
		this.setState({
			isPlaylistModalOpen: false,
			isEditModalOpen: false,
			isAddModalOpen:false
		});
	}


	render() {
		const { isAddModalOpen, data, isEditModalOpen, drillNeedToBeEdit, showSearch,showSearchButton,isPlaylistModalOpen, drillNeedToBeAddedToPlaylist  } = this.state; 
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
						<Button className='btn-dark pull-right m-2' onClick={this.handleToggleDrillModal}>
							Add Drill
						</Button>
					</Col>
				</Row>
				<Row>
					<Col md={12} style={{minWidth: "800px"}}>
						<Card
							content={
								<Table striped hover>
									<thead>
										<tr>
											<th>Id</th>
											<th>Name</th>
											<th>Athelete Name</th>
											<th>Category Name</th>
											<th>Difficulty Level</th>
											<th>Total Videos</th>
											<th>Thumbnail</th>
											<th>Action</th>
										</tr>
									</thead>
									<tbody>
										{data.map((drills, i) => {
											return (
												<tr key={i}>
													<td>{i + 1}</td>
													<td>
														<Link to={`drills/videos/${drills._id}`}>{drills.name}</Link>
													</td>
													<td>{drills.athlete.name}</td>
													<td>{drills.category.name}</td>
													<td>{drills.difficultyLevel.name}</td>
													<td>{drills.videos.length}</td>
													<td>
														
													<Link to={`drills/videos/${drills._id}`}>
													
														{(drills.thumbnail === undefined || drills.thumbnail === "null") ? (
																<Image src={avatar} width='150px' heigth='150px' />
																
															) : (
																<Image src={`${config.IMG_URL}/image/drills/${drills.thumbnail}`} width='150px' heigth='150px' onError={(e)=>{e.target.src=avatar}}/>
															)
														}
				
													</Link>

													</td>
													<td>
														<Dropdown>
															<Dropdown.Toggle variant='success' id='dropdown-basic'></Dropdown.Toggle>

															<Dropdown.Menu className="drillMenu">
																<li className='dropdown-item'>
																	<a onClick={() => this.handleToggleEditDrillModal("view",drills._id)}>View</a>
																</li>
																<li className='dropdown-item'>
																	<a onClick={() => this.handleToggleEditDrillModal('edit',drills._id)}>Edit</a>
																</li>
																<li>
																	<Link to={`drills/videos/${drills._id}`}>Add Videos</Link>
																</li>
																<li className='dropdown-item'>
																	<a onClick={() => this.handleToggleDrillPlaylistModal(drills._id, drills.name)}>Add to Playlist</a>
																</li>
																<li className='dropdown-item'>
																	<a onClick={() => this.handleDeleteDrill(drills._id)}>Delete</a>
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
					<DrillModal onClose={this.handleToggleDrillModal} isAddModalOpen={isAddModalOpen} handleAddDrill={this.handleAddDrill} />
				) : (
					""
				)}

				{isEditModalOpen ? (
					<EditDrillModal
						isEditModalOpen={isEditModalOpen}
						selection={this.state.selection}
						onClose={this.handleToggleEditDrillModal}
						drillNeedToBeEdit={drillNeedToBeEdit}
						handleEditDrill={this.handleEditDrill}
					/>
				) : (
					""
				)}


				{isPlaylistModalOpen ? (
					<PlaylistDrillModel
						isPlaylistModalOpen={isPlaylistModalOpen}
						onClose={this.handleToggleDrillPlaylistModal}
						drillNeedToBeAddedToPlaylist={drillNeedToBeAddedToPlaylist}
						handleDrillPlaylistModal={this.handleDrillPlaylistModal}
					/>
				) : (
					""
				)}
			</Grid>
		);
	}
}

export default Drill;
