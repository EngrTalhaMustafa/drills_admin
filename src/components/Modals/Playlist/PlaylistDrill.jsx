import React, { Component } from "react";
import Form from "../../common/Form";
import { Grid, Row, Col, Table, Button, Image, Dropdown, Modal } from "react-bootstrap";
import Joi from "joi";
import Axios from "axios";
import Auth from "../../Services/Auth";
import config from "config";
import uploadIcon from "../../../assets/img/uploadImg.png";
import AvatarEditor from 'react-avatar-editor';
import { toast } from "react-toastify";



class PlaylistDrillModel extends Form {
	state = {
		drillData: {
			id: "",
			name: "",
		},

		data: {},
		playlists:[],
		errors: {},
		
	};

	schema = Joi.object({
		playlist: Joi.string().required().label("Playlist"),
	});

	doSubmit = () => {
		const { data, drillData } = this.state;

		const playlistData = {
			drillId: drillData.id,
			drillName: drillData.name,
			playlistId: data.playlist,
		}


		Axios.post(`${config.API_URL}/admin/addtoplaylist`, playlistData, {
			headers: {
				Authorization: Auth.getToken(),
				"Content-Type": "application/json",
			},
		}).then((playlistResponse) => {
				if (playlistResponse.status === 200) {
					
					if(playlistResponse.data.success === false)
					{
						toast.error(playlistResponse.data.message);
					}else
					{
						toast.success("Added To Playlist Successfully.");
					}
					
					this.props.handleDrillPlaylistModal();
				}
			})
			.catch((error) => console.log(error));
	};

	componentDidMount = ()=>{
		this.setState({
			drillData:{
				id: this.props.drillNeedToBeAddedToPlaylist.drillID,
				name: this.props.drillNeedToBeAddedToPlaylist.drillName
			}
		});

		const token = localStorage.getItem("token");
		Axios
			.get(`${config.API_URL}/admin/playlist`, {
				headers: {
					Authorization: token,
				},
			})
			.then((response) => {
				this.setState({
					playlists: response.data.data.playlists,
				})
			});

	}



	render() {
		const { onClose, isPlaylistModalOpen } = this.props;
		const { errors,data,playlists } = this.state;
		return (
			<Modal show={isPlaylistModalOpen} onHide={onClose} backdrop="static" dialogClassName="modal-60w">
				<form onSubmit={this.handleSubmit}>
					<Modal.Header closeButton>
						<Modal.Title>Add To Playlist</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<div className='form-group'>

							
						<div className='col-md-12 col-sm-12 col-xs-12'>
									<div className='form-group'>
										<select className='form-control' name='playlist' value={data.speedLevel} onChange={this.handleOnChange}>
											<option value=''>Select Playlist</option>
											{playlists && playlists.length > 0
												? playlists.map((playlist, index) => {
													return (
														<option value={playlist._id} key={`playlist-${index}`}>
															{playlist.name}
														</option>
													);
												})
												: ""}
										</select>
										{errors.playlist && <span className='text-danger'>{errors.playlist}</span>}
									</div>
								</div>
						</div>

					</Modal.Body>
					<Modal.Footer>
						<Button className='btn-dark' size='lg' type='submit' block>
							Add To Playlist
						</Button>
					</Modal.Footer>
				</form>
			</Modal>
	
	
	);
	}
}

export default PlaylistDrillModel;
