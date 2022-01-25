import React, { useCallback, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import { useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { useFileUpload } from 'use-file-upload'
import { FaFileUpload, FaWindowClose, FaExpandAlt, FaEdit, FaLock, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import {
    cancel, saveAsync
} from '../../features/fournitureSlice'
import { MenuItem } from '@material-ui/core';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import GenericListView from './GenericListView';
import Dialog from '@material-ui/core/Dialog';
import { useHistory } from 'react-router-dom';
import { allowedScope } from '../utility/token-utility';
import StepWizard from "react-step-wizard";
import Grid from '@material-ui/core/Grid';
import { local } from '../../features/environment';
const placeHolderImage = "/default-avatar.png";

const useStyles = makeStyles({
    root: {
        maxWidth: 245,
        margin: 6,
        fontSize: '1em',
        position: 'relative'
    },
    media: {
        height: 120,
    },
    backdrop: {
        zIndex: 99,
        color: '#fff',
        width: '100%',
        position: 'absolute',
        top: '0',
        left: '0',
        height: '100%'
    },
    nextImageButton: {
        position: "relative",
        left:'92%',
        bottom:'2%'
    },
    nextButton: {
        position: "relative",
        right:'-1260%',
        bottom:'2%',
        //top: '48vh'
    },
    backButton: {
        position: "relative",
        left:'10%',
        bottom:'2%'
    },
    saveButton:{
        position:"relative",
        left:'23vw'
    }
});

export default function FournitureView(props) {
    const classes = useStyles();
    const intl = useIntl();
    const dispatch = useDispatch();
    const [fournitureName, setFournitureName] = useState(props.fourniture.fournitureName);
    const [image, selectFile] = useFileUpload()
    const errors = useSelector(state => {
        if (state?.fourniture?.error) {
            return state.fourniture.error;
        } else {
            return {}
        }
    })
    const [error, setError] = useState(errors)
    const loading = useSelector(state => {
        if (state.fourniture.status.id === props.fourniture.id) {
            return state.fourniture.status.status === 'loading'
        }
    })
    const defaultSrc = process.env.PUBLIC_URL + "public/default-avatar.png";
    const handleSave = () => {
        if (!fournitureName || fournitureName.length<1 || fournitureName.length>256) {
            setError({fournitureName:'Name cannot be blank'});
        } else {
            let imageValue = image ? image : props.fourniture.image ? props.fourniture.image : undefined
            console.log('imageValue', imageValue)
            dispatch(saveAsync({ id: props.fourniture.id, image:imageValue, fournitureName, brandId: props.fourniture.brandId }))
        }
    }
    useEffect(()=>{
        console.log('loading', loading, 'props.fourniture.editing', props.fourniture.editing)
        if (!loading&&!props.fourniture.editing){
            showEditorDialogue(false)
        }
    }, [loading])
    const handleCancel = () => {
        dispatch(cancel({ id: props.fourniture.id }));
    }
    const [editorDialogue, showEditorDialogue] = useState(props.fourniture && props.fourniture.editing);
    const history = useHistory();
    const [mode, setMode] = useState(props.fourniture.fournitureName ? 'DISPLAY':'EDIT');
    const canEdit=allowedScope(props.fourniture.brandId, 'fourniture:edit');
    const brand=useSelector(state=>{
        return state?.brand?.brands?.find(brand=>brand.id===props.fourniture.brandId);
    })
    const [isDirty, setDirty] = useState(false);
    useEffect(()=>{
        let dirty=fournitureName!==props.fourniture.fournitureName ||
            image!==props.fourniture.image;
        setDirty(dirty);
    })

    console.log('fournitureName', fournitureName)

    const detailedView = 
    <Card className={classes.root} m={18}>
        <Backdrop className={classes.backdrop} open={loading}>
            <CircularProgress color="inherit" />
        </Backdrop>
        <CardActionArea>
            <CardMedia
                className={classes.media}
                image={image && image.source ? image.source : props.fourniture.image ? props.fourniture.image : placeHolderImage}
            >
                {mode === 'EDIT' &&
                    <FaFileUpload
                        onClick={() => {
                            // Single File Upload
                            selectFile({ accept: 'image/*' })
                        }}
                        style={{ position: 'absolute', right: '0px', top: '0', fontSize: '2em', color: 'rgba(0,0,0,0.5)' }} />
                }
            </CardMedia>
            <CardContent>
                <TextField
                    value={fournitureName}
                    autoFocus
                    disabled={mode!=='EDIT'}
                    margin="none"
                    id="fournitureName"
                    label={intl.formatMessage({ id: 'fournitureName' })}
                    type="text"
                    error={error.fournitureName}
                    helperText={error.fournitureName}
                    fullWidth
                    onChange={(e) => setFournitureName(e.target.value)}
                />
            </CardContent>
        </CardActionArea>
        <CardActions>
            {mode === 'EDIT' &&
                <FaLock color="primary"
                    onClick={()=>setMode('DETAIL')}>
                </FaLock>
            }
            {mode === 'EDIT' &&
                <Button size="small" color="primary"
                    onClick={handleCancel}>
                    {intl.formatMessage({ id: 'delete' })}
                </Button>
            }
            {mode === 'EDIT' &&
                <Button size="small" color="primary"
                disabled={!isDirty}
                    onClick={handleSave}>
                    {intl.formatMessage({ id: 'save' })}
                </Button>
            }
            {isDirty}
            {mode !== 'EDIT' && canEdit &&
                    <div >
                <FaEdit color="primary"
                    onClick={()=>setMode('EDIT')}>
                </FaEdit>
                </div>
            }
        </CardActions>
    </Card>
    const [wizardInstance, setWizardInstance] = useState();
    const stepStyle={width: '30vw', height:'50vh'}
    const wizardView = 
    <Grid container style={{width: '30vw', height:'60vh', overflow:'hidden'}}>
        <StepWizard initialStep={1} instance={setWizardInstance}>
            <div style={stepStyle}>
            <Grid item container direction="column" justify="flex-start">
                <Typography variant="h8" component="h8">
                    {intl.formatMessage({ id: 'selectImageFournitureWizard' })}
                </Typography>
                <CardMedia
                className={classes.media}
                image={image && image.source ? image.source : props.fourniture.image ? props.fourniture.image : placeHolderImage}
                onClick={() => {
                    // Single File Upload
                    selectFile({ accept: 'image/*' })
                }}
                style={stepStyle}
            />
            </Grid>
            <Grid item container direction="column" justify="space-between" className={classes.nextImageButton}>
                <p><button onClick={()=>wizardInstance.nextStep()}><FaArrowRight/></button></p>
            </Grid>
            </div>
            
            <div style={stepStyle}>
            <Grid item container direction="row" justify="flex-start">
                <Typography variant="h8" component="h8">
                    {intl.formatMessage({ id: 'selectNameFournitureWizard' })}
                </Typography>
                <TextField
                    value={fournitureName}
                    autoFocus
                    margin="none"
                    id="fournitureName"
                    label={intl.formatMessage({ id: 'fournitureName' })}
                    type="text"
                    error={error.fournitureName}
                    helperText={error.fournitureName}
                    fullWidth
                    onChange={(e) => setFournitureName(e.target.value)}
                />
                <Grid item direction="row" justify="space-between">
                    <p><button onClick={()=>wizardInstance.previousStep()} className={classes.backButton}><FaArrowLeft/></button></p>
                </Grid>
                <Grid item direction="row" justify="space-between">
                <p><Button size="small" color="primary"
                className={classes.saveButton}
                disabled={!isDirty}
                    onClick={handleSave}>
                    {intl.formatMessage({ id: 'save' })}
                </Button></p>
                </Grid>

                </Grid>
            </div>
        </StepWizard>
        </Grid>
    if (props.displayMode === 'detail') {
        return (
            <>
            {detailedView}
            </>
        );
    } else {
        return (
            <>
                <GenericListView
                    image={image && image.source ? image.source : props.fourniture.image ? props.fourniture.image : placeHolderImage}
                    title={fournitureName}
                    onClick={()=>{
                        history.push('/fournitures/'+props.brand.id)
                    }}
                    >
                    <div style={{position:'absolute',left:'2px', top:'2px'}}>
                    <FaExpandAlt color="primary"
                        onClick={() => {
                            showEditorDialogue(true)
                        }}>
                    </FaExpandAlt>
                    </div>
                </GenericListView>
                <Dialog onClose={() => showEditorDialogue(false)} open={editorDialogue}>
                    <Grid>
                    <FaWindowClose onClick={() => {showEditorDialogue(false)}} style={{ position: 'absolute', zIndex: 99 }} />
                    {wizardView}
                    </Grid>
                </Dialog>
            </>
        )
    }
}