import React, { Component } from "react";
import { Grid, Row, Col, Table, Button, Image, Dropdown } from "react-bootstrap";
import Card from "components/Card/Card.jsx";
import SpeedLevelModal from "components/Modals/SpeedLevel/Index";
import Axios from "axios";
import { toast } from "react-toastify";
import EditSpeedLevelModal from "components/Modals/SpeedLevel/Edit";
import { confirmAlert } from "react-confirm-alert";
import SpeedLevelConfirmation from "components/common/SpeedLevelConfirmation";
import config from "../../config";
import Auth from "components/Services/Auth";

class SpeedLevel extends Component {
	state = {
		isAddModalOpen: false,
		isEditModalOpen: false,
		speedLevels: [],
		speedLevelNeedToBeEdit: "",
		showSearch: false,
		showSearchButton: true,
		selection:"",
		d_speed_level: "",
		new_speed_level_id:"",
		drills_data: "",
		drills: ""
	};

	handleToggleSpeedLevelModal = () => {
		this.setState({
			isAddModalOpen: !this.state.isAddModalOpen,
		});
	};

	handleToggleEditSpeedLevelModal = (edit,speedLevelId) => {
		this.setState({
			isEditModalOpen: !this.state.isEditModalOpen,
			speedLevelNeedToBeEdit: speedLevelId,
			selection:edit
		});
	};

	handleAddSpeedLevel = (speedLevelObject) => {
		this.setState({
			speedLevels: [...this.state.speedLevels, speedLevelObject],
			isAddModalOpen: false,
		});
		toast.success("Speed Level has been added successfully.");
	};

	handleEditSpeedLevel = (speedLevelObject) => {
	
		const { speedLevels } = this.state;
		const index = speedLevels.findIndex((speedLevel, index) => speedLevel._id === speedLevelObject.id);
		speedLevels[index] = speedLevelObject;
		this.setState({
			speedLevels: [...speedLevels],
			isEditModalOpen: false,
		});
		toast.success("Speed Level has been updated successfully.");
	};

	handleDeleteDifficulty = (difficultyId) => {
		const token = localStorage.getItem("token");
		
		Axios.get(`${config.API_URL}/admin/drills_speed/${difficultyId}`, {
				headers: {
					Authorization: token,
				},
			})
			.then((response) => {
				this.setState({
					d_speed_level: response.data.data.drills_count,
					drills_data: response.data.data.drills
				});

				confirmAlert({
					customUI: ({ onClose }) => {
						return <SpeedLevelConfirmation onDelete={this.deleteAction} onDeleteAll={this.onDeleteAllAction} onMove={this.moveAction} data = {this.state.speedLevels} videosCount={this.state.d_speed_level} onChangeData= {this.onChangeData}   onClose={onClose} id={difficultyId} />;
					},
				});
			});
			
	};

	deleteAction = (speedLevelId) => {
		Axios.delete(`${config.API_URL}/admin/speed/${speedLevelId}`, {
			headers: {
				Authorization: Auth.getToken(),
			},
		}).then((response) => {
				if (response.status === 200) {
					const { speedLevels } = this.state;
					const filteredSpeedLevels = speedLevels.filter((speedLevel, index) => speedLevel._id !== speedLevelId);
					this.setState({
						speedLevels: [...filteredSpeedLevels],
					});
					toast.success("Speed Level has been deleted successfully.");
				}
			})
			.catch((error) => {
				console.log(error);
			});
	};



	onDeleteAllAction = (id) => {
		const drill_docs = this.state.drills_data; 
		
		
		drill_docs.forEach(element => {

			this.handleSingledrillVideoDelete(element);
		
		});

		this.deleteAction(id);
		
		
	};

	handleSingledrillVideoDelete(videoNeedToBeDeleted){
		
		const response = {
			video: videoNeedToBeDeleted
		}

		Axios.post(`${config.API_URL}/admin/speed_drill_delete`, response, {
			headers: {
				Authorization: Auth.getToken(),
				"Content-Type": "application/json",
			},
		})
			.then((response) => {
				
				if (response.status === 200) {
					toast.success("Drill video has been deleted.");
				}
			})
			.catch((error) => {
				console.log(error);
			});

	}

	onChangeData = (catdata) => {
		this.setState({
			new_speed_level_id: catdata
		});

	};



	moveAction = (current, NewSpeed) => {

		const dataDLevelDrill={
			currentSpeed_Id: current,
			newSpeed_id: NewSpeed 
		}


		const token = localStorage.getItem("token");
		Axios.post(`${config.API_URL}/admin/drills_speed_move`, dataDLevelDrill, {
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



	

	componentDidMount() {
		Axios.get(`${config.API_URL}/admin/speed`, {
			headers: {
				Authorization: Auth.getToken(),
			},
		})
			.then((response) => {
				this.setState({
					speedLevels: [...response.data.data.speedLevel],
				});
			})
			.catch((error) => {
				console.log(error);
			});
	}

	toggleSearch = () => {
		const { showSearch,showSearchButton } = this.state;
		this.setState({
			showSearch: !showSearch,
			showSearchButton: !showSearchButton,
		});
	};
	handleSearch = (e) => {
		let search = e.currentTarget.value;
		Axios.get(`${config.API_URL}/admin/speed/?search=${search}`, {
			headers: {
				Authorization: Auth.getToken(),
			},
		}).then((response) => {
			this.setState({
				speedLevels: [...response.data.data.speedLevel],
			});
		});
	};
	render() {
		const { isAddModalOpen, isEditModalOpen, speedLevelNeedToBeEdit, speedLevels, showSearch,showSearchButton } = this.state;
		let speedLevelRows = null;
		const showSearchClass = showSearch ? "block" : "none";
		const showSearchButtonClass = showSearchButton ? "block" : "none";


		if (speedLevels.length > 0) {
			speedLevelRows = speedLevels.map((speedLevel, index) => {
				return (
					<tr key={`difficulty-${index}`}>
						<td>{index + 1}</td>
						<td>{speedLevel.name}</td>
						<td>{speedLevel.points}</td>
						<td>{speedLevel.condition}</td>
						<td>
							<Dropdown>
								<Dropdown.Toggle variant='success' id='dropdown-basic'></Dropdown.Toggle>
								<Dropdown.Menu>
									<li className='dropdown-item'>
										<a onClick={() => this.handleToggleEditSpeedLevelModal("view",speedLevel._id)} >View</a>
									</li>
									<li className='dropdown-item'>
										<a onClick={() => this.handleToggleEditSpeedLevelModal("edit",speedLevel._id)}>Edit</a>
									</li>
									<li className='dropdown-item'>
										<a onClick={() => this.handleDeleteDifficulty(speedLevel._id)}>Delete</a>
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
						<Button className='btn-dark pull-right m-2' onClick={() => this.handleToggleSpeedLevelModal("add")}>
							Add Speed Level
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
											<th>Points</th>
											<th>Watch(Times)</th>
											<th>Action</th>
										</tr>
									</thead>
									<tbody>{speedLevelRows}</tbody>
								</Table>
							}
						/>
					</Col>
				</Row>

				{isAddModalOpen ? (
					<SpeedLevelModal
						onClose={this.handleToggleSpeedLevelModal}
						isAddModalOpen={isAddModalOpen}
						handleAddSpeedLevel={this.handleAddSpeedLevel}
					/>
				) : (
					""
				)}

				{isEditModalOpen ? (
					<EditSpeedLevelModal
						onClose={this.handleToggleEditSpeedLevelModal}
						selection={this.state.selection}
						isEditModalOpen={isEditModalOpen}
						handleEditSpeedLevel={this.handleEditSpeedLevel}
						speedLevelNeedToBeEdit={speedLevelNeedToBeEdit}
					/>
				) : (
					""
				)}
			</Grid>
		);
	}
}

export default SpeedLevel;
