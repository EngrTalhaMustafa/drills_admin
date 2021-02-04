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
import EPagination from "components/common/EPagination";
import { createNoSubstitutionTemplateLiteral } from "typescript";

class drillsDisplay extends Component {
	state = {
		isAddModalOpen: false,
		isEditModalOpen: false,
		playlistNeedToBeEdit: "",
		selection:"",
		activePage:"",
		totalItems:"",
		showSearch: false,
		showSearchButton: true,
		specificPlaylist: [],
		playlistidrec:"",
		specificPlaylistCopy:[]
	};

	handleDeletePlaylist = (drillid) =>{
		confirmAlert({
			customUI: ({ onClose }) => {
				return <Confirmation onDelete={this.deleteAction} onClose={onClose} id={drillid} />;
			},
		});
	}


	handleSearch = (e) => {
		let search = e.currentTarget.value;

			if(search !== "")
			{
				this.setState({
					specificPlaylistCopy: [this.search(search,this.state.specificPlaylist)]
				})
				
			}
			else
			{
				this.setState({
					specificPlaylistCopy: [...this.state.specificPlaylist]
				})
			}

	};

	 search = (nameKey, myArray) =>{
		for (var i=0; i < myArray.length; i++) {
			if (myArray[i].name === nameKey) {
				return myArray[i];
			}
		}
	}


	deleteAction = (id) => {
		const playlistid = this.state.playlistidrec;
		const playlistDrillData = {
			playlistID: playlistid,
			drillID: id
		}

		axios
			.post(`${config.API_URL}/admin/deletedrillplaylist`, playlistDrillData, {
				headers: {
					Authorization: Auth.getToken(),
				},
			})
			.then((response) => {
				this.getAllData();
				toast.success("Drill Removed From Playlist Successfully.");
			})
			.catch((error) => console.log(error));
	};

	toggleSearch = () => {
		const { showSearch,showSearchButton } = this.state;
		this.setState({
			showSearch: !showSearch,
			showSearchButton: !showSearchButton,
		});
	};




	getAllData = () => {
		
		axios.get(`${config.API_URL}/admin/drillplaylist/?id=${this.state.playlistidrec}`, {
			headers: {
				Authorization: Auth.getToken(),
			},
		}).then((response) => {
			this.setState({
				specificPlaylist: [...response.data.data.playlists][0].drills,
				specificPlaylistCopy: [...response.data.data.playlists][0].drills,
				totalItems :  [...response.data.data.playlists][0].drills.length
			});
		});
	};
		
	componentDidMount() {
		const token = localStorage.getItem("token");
		const playlistID = this.props.match.params.id;
		this.setState({
			playlistidrec: this.props.match.params.id
		})
		axios.get(`${config.API_URL}/admin/drillplaylist/?id=${playlistID}`, {
			headers: {
				Authorization: Auth.getToken(),
			},
		}).then((response) => {
			
			this.setState({
				specificPlaylist: [...response.data.data.playlists][0].drills,
				specificPlaylistCopy: [...response.data.data.playlists][0].drills,
				totalItems :  [...response.data.data.playlists][0].drills.length
			});
		});
	}
	
	render() {
		const { specificPlaylist, showSearch,showSearchButton,specificPlaylistCopy  } = this.state;
		let playlistRows = null;
		const showSearchClass = showSearch ? "block" : "none";
		const showSearchButtonClass = showSearchButton ? "block" : "none";

		if (specificPlaylistCopy.length > 0) {
			playlistRows = specificPlaylistCopy.map((drill, index) => {
				if(drill !== undefined)
				{
					return (
						<tr key={`playlist-${index}`}>
							<td>{index + 1}</td>
							<td>{drill.name}</td>
							<td>
								<Dropdown>
									<Dropdown.Toggle variant='success' id='dropdown-basic'></Dropdown.Toggle>
	
									<Dropdown.Menu>
										<li className='dropdown-item'>
											<a onClick={() => this.handleDeletePlaylist(drill._id)}>Delete</a>
										</li>
									</Dropdown.Menu>
								</Dropdown>
							</td>
						</tr>
					);
				}else
				{
					return (
						<tr>
							<td>No Record Found/ Try to write complete name</td>
						</tr>
					);
				}
			});
		}else
		{
			return (
				<tr>
					<td><h4>No Record Found</h4></td>
				</tr>
			);

		}

		return (
			<Grid fluid>
				<Row style={{ margin: "10px 0 10px 0" }}>
					<Col md={12}>
						<input  onBlur={this.toggleSearch} className='search-bar' placeholder='Search...' style={{ display: showSearchClass }} onChange={this.handleSearch} />
						<Button className='search-btn' style={{ display: showSearchButtonClass}} onClick={this.toggleSearch}>
							<i className='pe-7s-search'></i>
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
											<th>Action</th>
										
										</tr>
									</thead>
									
									<tbody>
										{specificPlaylistCopy.map((drill, i) => {
											if(drill !== undefined)
											{
												return (
													<tr>
														<td>{i + 1}</td>
														<td>{drill.name}</td>
														<td>
															
																<Row>
																	<Dropdown>
																		<Dropdown.Toggle variant='success' id='dropdown-basic'></Dropdown.Toggle>
	
																		<Dropdown.Menu>
																			<li className='dropdown-item' style={{cursor:"pointer"}}>
																				<a onClick={() => this.handleDeletePlaylist(drill._id)}>Delete</a>
																			</li>
																		</Dropdown.Menu>
																	</Dropdown>
																</Row>
								
														</td>
													</tr>
												);
											}else{
												return (
													<tr>
														<td>No Record Found/ Try to write complete name</td>
													</tr>
												);
											}
											
										})}
									</tbody>
							
								</Table>
							}
						/>
					</Col>
				</Row>

			</Grid>
		);
	}
}

export default drillsDisplay;
