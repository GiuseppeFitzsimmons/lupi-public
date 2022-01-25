import React, {useCallback, useState, useEffect} from 'react';
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
import { FaWindowClose, FaExpandAlt, FaEdit, FaLock, FaFileUpload, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import {
  cancelCreateCollection, saveCollectionAsync
  } from '../../features/collectionSlice'
import {
  cancelCreateProduct, saveProductAsync
  } from '../../features/productSlice'
import { MenuItem } from '@material-ui/core';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { allowedScope } from '../utility/token-utility';
import GenericListView from './GenericListView';
import Dialog from '@material-ui/core/Dialog';
import StepWizard from "react-step-wizard";
import Grid from '@material-ui/core/Grid';
import { useFileUpload } from 'use-file-upload';
import { useHistory } from 'react-router-dom';

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

export default function ProductView(props) {
    const history = useHistory();
    const classes = useStyles();
    const intl = useIntl();
    const dispatch = useDispatch();
    const [productName, setProductName] = useState(props.product.productName);
    const error=useSelector(state => {
        //TODO this specific collection
        return {}
    })
    const loading=useSelector(state=>{
        if (state.product.status.id===props.product.id) {
            return state.product.status.status==='loading'
        }
    })
    const handleSave = () => {
        dispatch(saveProductAsync({id:props.product.id, productName, collectionId: props.product.collectionId}))
    }
    const handleCancel = () => {
        dispatch(cancelCreateProduct({product:props.product}));
    }
    const [mode, setMode] = useState(props.product.productName ? 'DISPLAY':'EDIT');
    const canEdit=allowedScope(props.product.collectionId, 'collection:edit');
    const [editorDialogue, showEditorDialogue] = useState(false);
    const placeHolderImage = "/default-avatar.png";
    const collection=useSelector(state=>{
        console.log('state?.collection?.collections', state?.collection?.collections)
        //return state?.collection?.collections?.find(collection=>collection.id===props.product.collectionId);
    })
    console.log("PRODUCT VIEW", props.product)
    const [isDirty, setDirty] = useState(false);
    useEffect(()=>{
        let dirty=productName!==props.product.productName
        setDirty(dirty);
    })
    const [image, selectFile] = useFileUpload()

    const detailedView = <Card className={classes.root} m={18}>
    <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
    </Backdrop>
        <CardActionArea>
            <CardContent>
                <TextField
                    value={productName}
                    autoFocus
                    disabled={mode!=='EDIT'}
                    margin="none"
                    id="productName"
                    label={intl.formatMessage({ id: 'productName' })}
                    type="text"
                    error={error.productName}
                    helperText={error.productName}
                    fullWidth
                    onChange={(e)=>setProductName(e.target.value)}
                />
            </CardContent>
        </CardActionArea>
        <CardActions>
            {mode === 'EDIT' &&
                <FaLock color="primary"
                    onClick={()=>setMode('DETAIL')}>
                </FaLock>
            }
            {mode==='EDIT' &&
                <Button size="small" color="primary"
                    onClick={handleCancel}>
                {intl.formatMessage({ id: 'delete' })}
                </Button>
           } 
           {mode==='EDIT' &&
                <Button size="small" color="primary"
                    disabled={!isDirty}
                    onClick={handleSave}>
                {intl.formatMessage({ id: 'save' })}
                </Button>
            }
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
    const summaryView=
    <Grid container style={{width: '30vw', height:'60vh', overflow:'hidden'}}>
        <StepWizard initialStep={1} instance={setWizardInstance}>
            <div style={stepStyle}>
            <Grid item container direction="column" justify="flex-start">
                <Typography variant="h8" component="h8">
                    {intl.formatMessage({ id: 'selectImageProductWizard' })}
                </Typography>
                <CardMedia
                className={classes.media}
                image={image && image.source ? image.source : props.product.image ? props.product.image : placeHolderImage}
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
                    {intl.formatMessage({ id: 'selectNameProductWizard' })}
                </Typography>
                <TextField
                    value={productName}
                    autoFocus
                    margin="none"
                    id="productName"
                    label={intl.formatMessage({ id: 'productName' })}
                    type="text"
                    error={error.productName}
                    helperText={error.productName}
                    fullWidth
                    onChange={(e) => setProductName(e.target.value)}
                />
                <Grid item direction="row" justify="space-between">
                    <p><button onClick={()=>wizardInstance.previousStep()} className={classes.backButton}><FaArrowLeft/></button></p>
                </Grid>
                <Grid item direction="row" justify="space-between">
                    <p><button disabled={!productName} onClick={()=>wizardInstance.nextStep()} className={classes.nextButton}><FaArrowRight/></button></p>
                </Grid>

                </Grid>
            </div>
            <div>
                <TextField
                    value={'roundingRules'}
                    margin="none"
                    id="roundingRules"
                    label={intl.formatMessage({ id: 'roundingRules' })}
                    type="text"
                    error={error.roundingRules}
                    helperText={error.roundingRules}
                    fullWidth
                    onChange={(e) => console.log('changed rounding rules')}
                />
                <Grid container>
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
                <Backdrop className={classes.backdrop} open={loading}>
            <CircularProgress color="inherit" />
        </Backdrop>
            </div>
        </StepWizard>
    </Grid>
    

    
    //if (props.displayMode === 'detail') {
    if (props.displayMode === 'detail') {
        return (
            detailedView
        );
    } else {
        return (
            <>
                <GenericListView
                    image={image && image.source ? image.source : props.product.image ? props.product.image : placeHolderImage}
                    title={productName}
                    onClick={()=>{
                        //history.push('/collections/'+props.product.id)
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
                    <FaWindowClose onClick={() => {showEditorDialogue(false); console.log('showEditorDialogue')}} style={{ position: 'absolute', zIndex: 99 }} />
                    {summaryView}
                    </Grid>
                </Dialog>
            </>
        )
    }
}