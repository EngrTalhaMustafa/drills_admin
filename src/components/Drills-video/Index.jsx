import React, { Component } from "react";
import { Grid, Row, Col, Table, Button, Image, Dropdown } from "react-bootstrap";
import Card from "components/Card/Card.jsx";
import axios from "axios";
import avatar from "../../assets/img/uploadImg.png";
import config from "../../config";
import Auth from "components/Services/Auth";
import DrillVideoModal from "components/Modals/DrillVideo/Index";
import Axios from "axios";
import ReactPlayer from "react-player";
import { toast } from "react-toastify";

class DrillVideo extends Component {
	state = {
		isAddModalOpen: false,
		isEditModalOpen: false,
		drill: [],
	};

	getDrill = () => {
		const drillId = this.props.match.params.id;
		axios
			.get(`${config.API_URL}/admin/drills/${drillId}`, {
				headers: {
					Authorization: Auth.getToken(),
				},
			})
			.then((response) => {
				if (response.status === 200) {
					this.setState({
						drill: response.data.data.drills,
						isAddModalOpen: false,
					});
				}
			})
			.catch((error) => {
				console.log(error);
			});
	};
	componentDidMount() {
		this.getDrill();
	}

	handleToggleAddDrillVideoModal = () => {
		this.setState({
			isAddModalOpen: !this.state.isAddModalOpen,
		});
	};

	handleAddDrillVideo = (videoObject) => {
		let { drill } = this.state;
		const response = {
			name: drill[0].name,
			athlete: drill[0].athlete._id,
			category: drill[0].category._id,
			difficultyLevel: drill[0].difficultyLevel._id,
			isPremium: drill[0].isPremium,
			thumbnail: drill[0].thumbnail,
			videos: [...drill[0].videos, videoObject],
		};

		Axios.post(`${config.API_URL}/admin/drills/${drill[0]._id}`, response, {
			headers: {
				Authorization: Auth.getToken(),
			},
		})
			.then((response) => {
				if (response.status === 200) {
					toast.success("Drill video has been created.");
					this.getDrill();
				}
			})
			.catch((error) => console.log(error));
	};

	handleDeleteVideo = (videoNeedToBeDeleted) => {
		const { drill } = this.state;
		const filterVideos = drill[0].videos.filter((video, index) => video._id !== videoNeedToBeDeleted);
		const deletedVideo = drill[0].videos.filter((video, index) => video._id === videoNeedToBeDeleted);
		const deletedVideoArray = [];
		deletedVideoArray.push(deletedVideo[0].thumbnail, deletedVideo[0].video);
		drill[0].videos = [...filterVideos];
		const response = {
			...drill[0],
			deletedfiles: deletedVideoArray,
		};

		Axios.post(`${config.API_URL}/admin/drills/${drill[0]._id}`, response, {
			headers: {
				Authorization: Auth.getToken(),
				"Content-Type": "application/json",
			},
		})
			.then((response) => {

				if (response.status === 200) {
					toast.success("Drill video has been deleted.");
					this.setState({
						drill: [drill[0]],
					});
				}
			})
			.catch((error) => {
				console.log(error);
			});
	};

	durationDisplay = (seconds) =>{
		const format = val => `0${Math.floor(val)}`.slice(-2)
		const hours = seconds / 3600
		const minutes = (seconds % 3600) / 60
	  
		return [hours, minutes, seconds % 60].map(format).join(':')
	  }


	render() {
		const { isAddModalOpen, drill, isEditModalOpen, drillNeedToBeEdit } = this.state;

		return (
			<Grid fluid>
				<Row>
					<Col md={12} style={{ margin: "10px 0 10px 0" }}>
						<Button className='btn-dark pull-right m-2' onClick={this.handleToggleAddDrillVideoModal}>
							Add Drill Video
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
											<th>Drill Name</th>
											<th>Speed Level</th>
											<th>Thumbnail</th>
											<th>Video</th>
											<th>Premium Status</th>
											<th>Duration(hh:mm:ss)</th>
											<th>Action</th>
										</tr>
									</thead>	
									<tbody>
										{drill.map((data, index) => {
											if (data.videos && data.videos.length > 0) {
												return data.videos.map((video, index) => {
													return (
														<tr>
															<td>{index + 1}</td>
															<td>{data.name}</td>
															<td>{video.speedLevel.name}</td>
															<td>
												
															{(video.thumbnail === undefined || video.thumbnail === "null") ? (
																	<Image src={avatar} width='150px' heigth='150px' />
																) : (
																	<Image src={`${config.IMG_URL}/image/drills/${video.thumbnail}`} width='150px' heigth='150px' onError={(e)=>{e.target.src=avatar}}/>
																)
															}

															</td>
															<td>
																<ReactPlayer
																	url={`${config.IMG_URL}/image/drills/${video.video}`}
																	config={{ file: { attributes: { controlsList: 'nodownload'} } }}
																	controls={true}
																	width='150px'
																	height='100px'
																/>
															</td>
															<td>{(video.isPremium === true)? <b style={{color: '#cba425'}}>Premium</b> : <b>Free</b>}</td>
															<td>{this.durationDisplay(video.duration)}</td>
															<td>
																<Dropdown>
																	<Dropdown.Toggle variant='success' id='dropdown-basic'></Dropdown.Toggle>

																	<Dropdown.Menu>
																		<li className='dropdown-item'>
																			<a
																				onClick={() => {
																					this.handleDeleteVideo(video._id);
																				}}
																			>
																				Delete
																			</a>
																		</li>
																	</Dropdown.Menu>
																</Dropdown>
															</td>
														</tr>
													);
												});
											}
										})}
									</tbody>
								</Table>
							}
						/>
					</Col>
				</Row>
				{isAddModalOpen ? <DrillVideoModal onClose={this.handleToggleAddDrillVideoModal} isAddModalOpen={isAddModalOpen} handleAddDrillVideo={this.handleAddDrillVideo} /> : ""}
			</Grid>
		);
	}
}

export default DrillVideo;
