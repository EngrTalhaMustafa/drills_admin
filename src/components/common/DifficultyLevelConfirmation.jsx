import React from "react";
import { Button, Modal, Row } from "react-bootstrap";
import trashIcon from "../../assets/img/delIcon.png";


const Confirmation = ({ onClose, onDelete, onMove, videosCount, onDeleteAll, data, id }) => {

	var newDiff = "";
	var error = "";


	const onChangeData = (e) =>{
		newDiff = e.target.value;
	}

	const onMoveCheck = (id, newDiff) =>{


		
		if(newDiff === "" || newDiff === "Select Difficulty Level")
		{
			alert("Select Difficulty Level")
		}else
		{
			onMove(id,newDiff);
			onClose();
		}
		
	}
	

	return (
		<Modal show={true} onHide={onClose} backdrop="static">
			<Modal.Header closeButton>
				<Modal.Title>Are you sure?</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Row className='text-center'>
					<h4>{(videosCount > 0 ) ? ((videosCount > 1) ? videosCount + " Drills Found" : videosCount + " Drill Found") : ""} </h4>
				</Row>
				<Row>

				{(videosCount > 0 ) ? <Row style={{marginLeft: "50px"}}>

						<br/>
						<p><b>Select Move Del: &nbsp;</b> Select New Difficulty Level and Move</p>
						<br/>
						<p><b>Select Delete: &nbsp;</b> Delete all videos with Difficulty Level at once</p>
						<br/>
						<p><b>Select Cancel: &nbsp;</b> Cancel this Dialog</p>
						<br/>

						<div className='col-md-10 col-sm-10 col-xs-10'>
							<div className='form-group'>
								<select className='form-control' name='difficultylevelId' onChange={onChangeData}>
									<option value=''>Select Difficulty Level</option>
									
									{data && data.length > 0
										? data.map((Difficulty, index) => {
											if(Difficulty._id != id)
											{
												return (
													<option value={Difficulty._id}  key={`difficulty-${index}`}>
													   {Difficulty.name}
												   </option>
											   );
											}
												
											})
										: ""}
								</select>
								{(error === "") ? "" : <span className='text-danger'>{error}</span>}
							</div>
						</div>

					</Row>

					:
					<Row style={{marginLeft: "0px"}} className='text-center'>
						<img src={trashIcon}/>
					
					</Row>
				}

				</Row>
			</Modal.Body>
			<Modal.Footer style={{ textAlign : "center" }}>

				{(videosCount > 0 ) ?

					<Row>

					<Button
						className='btn-dark'
						size='md'
						onClick={() => {
							onMoveCheck(id,newDiff);
						}}
					>
						Move
					</Button>
					<Button
						className='btn-dark'
						size='md'
						onClick={() => {
							onDeleteAll(id);
							onClose();
						}}
					>
						Delete All
					</Button>
					<Button className='btn-dark' size='md' onClick={onClose}>
						Cancel
					</Button>

					</Row>

					:

					<Row>

					<Button
						className='btn-dark'
						size='md'
						onClick={() => {
							onDelete(id);
							onClose();
						}}
					>
						Delete
					</Button>

					<Button className='btn-dark' size='md' onClick={onClose}>
						Cancel
					</Button>


					</Row>

				}

			</Modal.Footer>
		</Modal>
	);
};

export default Confirmation;
