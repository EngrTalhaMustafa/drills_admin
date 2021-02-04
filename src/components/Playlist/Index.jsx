import React, { Component } from "react";
import { Grid, Row, Col, Table, Button, Image, Dropdown } from "react-bootstrap";
import { Redirect,withRouter } from "react-router";
import Card from "components/Card/Card.jsx";
import avatar from "../../assets/img/uploadImg.png";
import axios from "axios";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import Confirmation from "components/common/Confirmation";
import config from "config";
import Auth from "components/Services/Auth";
import PlaylistModal from "components/Modals/Playlist/Index";
import EditPlaylistModal from "components/Modals/Playlist/Edit";
import EPagination from "components/common/EPagination";
import DrillsListDisplay from "./drillsDisplay";
import { Link } from "react-router-dom";

class Playlist extends Component {
	state = {
		isAddModalOpen: false,
		isEditModalOpen: false,
		playlists: [],
		playlistNeedToBeEdit: "",
		selection:"",
		activePage:"",
		totalItems:"",
		showSearch: false,
		showSearchButton: true,
		showdrillslist:false
	};

	handleTogglePlaylistModal = () => {
		this.setState({
			isAddModalOpen: !this.state.isAddModalOpen,
		});
	};

	handleToggleEditPlaylistModal = (edit,playlistId) => {
		this.setState({
			isEditModalOpen: !this.state.isEditModalOpen,
			playlistNeedToBeEdit: playlistId,
			selection: edit
		});
	};

	handleAddDrill = () => {
		this.setState({
			isAddModalOpen: false,
		});
		this.getAllData();
	};

	handleEditPlaylist = () => {
		this.setState({
			isEditModalOpen: false,
		});
		this.getAllData();
	};

	handleDeletePlaylist = (playlistId) => {
		confirmAlert({
			customUI: ({ onClose }) => {
				return <Confirmation onDelete={this.deleteAction} onClose={onClose} id={playlistId} />;
			},
		});
	};

	deleteAction = (id) => {
		axios
			.delete(`${config.API_URL}/admin/playlist/${id}`, {
				headers: {
					Authorization: Auth.getToken(),
				},
			})
			.then((response) => {
				const newdata = this.state.playlists.filter((i) => {
					return i._id !== id;
				});
				this.setState({
					playlists: newdata,
					totalItems: response.data.data.count,
				});
				toast.success("Playlist has been deleted successfully.");
			})
			.catch((error) => console.log(error));
	};

	handleAddDrillList = () =>{
		this.props.history.push("/admin/drills")
	}

	handleSearch = (e) => {
		let search = e.currentTarget.value;
		axios.get(`${config.API_URL}/admin/playlist/?search=${search}`, {
			headers: {
				Authorization: Auth.getToken(),
			},
		}).then((response) => {
			this.setState({
				playlists: [...response.data.data.playlists],
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


	handlePageChange = (pageNumber) => {
		const token = localStorage.getItem("token");
		axios
			.get(`${config.API_URL}/admin/playlist/?page=${pageNumber}`, {
				headers: {
					Authorization: token,
				},
			})
			.then((response) => {
	
				this.setState({
					activePage: pageNumber,
					playlists: response.data.data.playlists,
				});
			});
	};

	handleAddPlaylist = () => {
		this.setState({
			isAddModalOpen: false,
		});
		this.getAllData();
	};

	getAllData = () => {
		const token = localStorage.getItem("token");
		axios.get(`${config.API_URL}/admin/playlist`, {
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
			.get(`${config.API_URL}/admin/playlist`, {
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
	
	render() {
		const { isAddModalOpen, isEditModalOpen, playlistNeedToBeEdit, playlists, showSearch,showSearchButton  } = this.state;
		let playlistRows = null;
		const showSearchClass = showSearch ? "block" : "none";
		const showSearchButtonClass = showSearchButton ? "block" : "none";

		if (playlists.length > 0) {
			playlistRows = playlists.map((playlist, index) => {
				return (
					<tr key={`playlist-${index}`}>
						<td>{index + 1}</td>
						<td>{playlist.name}</td>
						<td>${playlist.price}</td>
						<td>{playlist.details}</td>
						<td>
							<Dropdown>
								<Dropdown.Toggle variant='success' id='dropdown-basic'></Dropdown.Toggle>

								<Dropdown.Menu>
									<li className='dropdown-item'>
										<a onClick={() => this.handleToggleEditPlaylistModal('view',playlist._id)}>View</a>
									</li>
									<li className='dropdown-item'>
										<a onClick={() => this.handleToggleEditPlaylistModal('edit',playlist._id)}>Edit</a>
									</li>
									<li className='dropdown-item'>
										<a onClick={() => this.handleDeletePlaylist(playlist._id)}>Delete</a>
									</li>
								</Dropdown.Menu>
							</Dropdown>
						</td>
					</tr>
				);
			});
		}

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
						<Button className='btn-dark pull-right m-2' onClick={this.handleTogglePlaylistModal}>
							Create Playlist
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
											<th>Name</th>
											<th>Thumbnail</th>
											<th>Drills Count</th>
											<th>Action</th>
										</tr>
									</thead>
									
									<tbody>
										{playlists.map((playlist, i) => {
											return (
												<tr>
													<td>{i + 1}</td>
													<td>{playlist.name}</td>
													<td>
														{(playlist.thumbnail === undefined || playlist.thumbnail === "null") ? (
															<Image src={avatar} style={{ width: "50px"}} roundedCircle />
														) : (
															<Image src={`${config.IMG_URL}/image/playlist/${playlist.thumbnail}`} style={{ width: "50px"}}  onError={(e)=>{e.target.src=avatar}}/>
														)
														}
													</td>
													<td>{playlist.drills.length}</td>
													<td>
														
															<Row>
																<Dropdown>
																	<Dropdown.Toggle variant='success' id='dropdown-basic'></Dropdown.Toggle>

																	<Dropdown.Menu>
																		<li className='dropdown-item' style={{cursor:"pointer"}}>
																			<a onClick={() => this.handleAddDrillList("drill", playlist._id)}>Add Drill</a>
																		</li>
																		<li className='dropdown-item' style={{cursor:"pointer"}}>
																			<Link to={`playlist/drillsplaylist/${playlist._id}`}>View List</Link>
																		</li>
																		<li className='dropdown-item' style={{cursor:"pointer"}}>
																			<a onClick={() => this.handleToggleEditPlaylistModal("view", playlist._id)}>View</a>
																		</li>
																		<li className='dropdown-item' style={{cursor:"pointer"}}>
																			<a onClick={() => this.handleToggleEditPlaylistModal("edit", playlist._id)}>Edit</a>
																		</li>
																		<li className='dropdown-item' style={{cursor:"pointer"}}>
																			<a onClick={() => this.handleDeletePlaylist(playlist._id)}>Delete</a>
																		</li>
																	</Dropdown.Menu>
																</Dropdown>
															</Row>
							
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
							items={this.state.playlists}
						/>
					</Col>
				</Row>

				{isAddModalOpen ? (
					<PlaylistModal
						onClose={this.handleTogglePlaylistModal}
						isAddModalOpen={isAddModalOpen}
						handleAddPlaylist={this.handleAddPlaylist}
					/>
				) : (
					""
				)}

				{isEditModalOpen ? (
					<EditPlaylistModal
						onClose={this.handleToggleEditPlaylistModal}
						selection={this.state.selection}
						isEditModalOpen={isEditModalOpen}
						handleEditPlaylist={this.handleEditPlaylist}
						playlistNeedToBeEdit={playlistNeedToBeEdit}
					/>
				) : (
					""
				)}
			</Grid>
		);
	}
}

export default withRouter(Playlist);
