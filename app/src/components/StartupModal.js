import React, { Component } from 'react';
import { Modal, Input, Form, Button } from 'semantic-ui-react';

import connectionActions from '../actions/connectionActions.js';
import { connect } from 'react-redux';

class StartupModal extends Component {
    state = {
        name: '',
    }

    constructor (props) {
        super(props);
        this.nameInputRef = React.createRef ();
    }

    componentDidMount = _ => {
        // focus the textbox
        this.nameInputRef.current.focus ();
    }

    handleNameInputChange = e => {
        this.setState ({
            name: e.target.value
        });
    }

    handleSubmitButton = _ => {
        if (this.state.name !== '')
            this.props.setName(this.state.name);
    }

    render = () => (
        <Modal open className='animated bounceIn' size='tiny' >
            <Modal.Header>Enter a username!</Modal.Header>
            <Modal.Content>
                <Form>
                    <Form.Field>
                        <label>Name</label>
                        <Input ref={this.nameInputRef} onChange={this.handleNameInputChange} />
                    </Form.Field>
                    <Button type='submit' onClick={this.handleSubmitButton} color={this.state.name ? 'blue' : 'grey'}>Join room!</Button>
                </Form>
            </Modal.Content>
        </Modal>
    )
}

const mapStateToProps = store => ({
    serverConnection: store.connection.serverConnection,
});

const mergeProps = (stateProps, dispatchProps) => {
    const { serverConnection } = stateProps;
    const { dispatch } = dispatchProps;

    return {
        ...stateProps,

        setName: name => {
            serverConnection.send({
                type: 'name',
                name,
            });
            dispatch(connectionActions.SET_NAME(name));
        },
    };
};

export default connect(mapStateToProps, null, mergeProps)(StartupModal);
