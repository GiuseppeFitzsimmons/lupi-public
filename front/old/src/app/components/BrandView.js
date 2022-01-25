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
} from '../../features/brandSlice'
import { MenuItem } from '@material-ui/core';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import GenericListView from './GenericListView';
import Dialog from '@material-ui/core/Dialog';
import { useHistory } from 'react-router-dom';
import { allowedScope } from '../utility/token-utility';
import BrandWizard from "./BrandWizard";
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

export default function BrandView(props) {
    const classes = useStyles();
    const intl = useIntl();
    const dispatch = useDispatch();
    const [brandName, setBrandName] = useState(props.brand.brandName);
    const [siret, setSiret] = useState(props.brand.siret);
    const [addressLine1, setAddressLine1] = useState(props.brand.addressLine1);
    const [addressLine2, setAddressLine2] = useState(props.brand.addressLine2);
    const [postalCode, setPostalCode] = useState(props.brand.postalCode);
    const [clientPaymentConditions, setClientPaymentConditions] = useState(props.brand.clientPaymentConditions);
    const [operatingCurrency, setOperatingCurrency] = useState(props.brand.operatingCurrency);
    const [roundingRules, setRoundingRules] = useState(props.brand.roundingRules);
    const [image, selectFile] = useFileUpload()
    const errors = useSelector(state => {
        if (state?.brand?.error) {
            return state.brand.error;
        } else {
            return {}
        }
    })
    const [error, setError] = useState(errors)
    const loading = useSelector(state => {
        if (state.brand.status.id === props.brand.id) {
            return state.brand.status.status === 'loading'
        }
    })
    const defaultSrc = process.env.PUBLIC_URL + "public/default-avatar.png";
    const handleSave = () => {
        if (!brandName || brandName.length<1 || brandName.length>256) {
            setError({brandName:'Name cannot be blank'});
        } else {
            let imageValue = image ? image : props.brand.image ? props.brand.image : undefined
            console.log('imageValue', imageValue)
            dispatch(saveAsync({ id: props.brand.id, brandName, siret, addressLine1, addressLine2, postalCode, clientPaymentConditions, operatingCurrency, roundingRules, image:imageValue }))
        }
    }
    useEffect(()=>{
        console.log('loading', loading, 'props.brand.editing', props.brand.editing)
        if (!loading&&!props.brand.editing){
            showEditorDialogue(false)
        }
    }, [loading])
    const handleCancel = () => {
        dispatch(cancel({ id: props.brand.id }));
    }
    const [editorDialogue, showEditorDialogue] = useState(props.brand && props.brand.editing);
    const history = useHistory();
    const [mode, setMode] = useState(props.brand.brandName ? 'DISPLAY':'EDIT');
    const canEdit=allowedScope(props.brand.id, 'brand:edit');
    const [isDirty, setDirty] = useState(false);
    useEffect(()=>{
        let dirty=brandName!==props.brand.brandName ||
            siret!==props.brand.siret ||
            addressLine1!==props.brand.addressLine1 ||
            addressLine2!==props.brand.addressLine2 ||
            postalCode!==props.brand.postalCode ||
            clientPaymentConditions!==props.brand.clientPaymentConditions ||
            operatingCurrency!==props.brand.operatingCurrency ||
            roundingRules!==props.brand.roundingRules ||
            image!==props.brand.image;
        setDirty(dirty);
    })

    console.log('brandName', brandName)

    const detailedView = 
    <Card className={classes.root} m={18}>
        <Backdrop className={classes.backdrop} open={loading}>
            <CircularProgress color="inherit" />
        </Backdrop>
        <CardActionArea>
            <CardMedia
                className={classes.media}
                image={image && image.source ? image.source : props.brand.image ? props.brand.image : placeHolderImage}
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
                    value={brandName}
                    autoFocus
                    disabled={mode!=='EDIT'}
                    margin="none"
                    id="brandName"
                    label={intl.formatMessage({ id: 'brandName' })}
                    type="text"
                    error={error.brandName}
                    helperText={error.brandName}
                    fullWidth
                    onChange={(e) => setBrandName(e.target.value)}
                />
                <TextField
                    value={siret}
                    disabled={mode!=='EDIT'}
                    margin="none"
                    id="siret"
                    label={intl.formatMessage({ id: 'siret' })}
                    type="text"
                    error={error.siret}
                    helperText={error.siret}
                    fullWidth
                    onChange={(e) => setSiret(e.target.value)}
                />
                <TextField
                    value={addressLine1}
                    disabled={mode!=='EDIT'}
                    margin="none"
                    margin="addressLine1"
                    id="addressLine1"
                    label={intl.formatMessage({ id: 'addressLine1' })}
                    type="text"
                    error={error.addressLine1}
                    helperText={error.addressLine1}
                    fullWidth
                    onChange={(e) => setAddressLine1(e.target.value)}
                />
                <TextField
                    value={addressLine2}
                    disabled={mode!=='EDIT'}
                    margin="none"
                    id="addressLine2"
                    label={intl.formatMessage({ id: 'addressLine2' })}
                    type="text"
                    error={error.addressLine2}
                    helperText={error.addressLine2}
                    fullWidth
                    onChange={(e) => setAddressLine2(e.target.value)}
                />
                <TextField
                    value={postalCode}
                    disabled={mode!=='EDIT'}
                    margin="none"
                    id="postalCode"
                    label={intl.formatMessage({ id: 'postalCode' })}
                    type="text"
                    error={error.postalCode}
                    helperText={error.postalCode}
                    fullWidth
                    onChange={(e) => setPostalCode(e.target.value)}
                />
                <TextField
                    value={clientPaymentConditions}
                    disabled={mode!=='EDIT'}
                    margin="none"
                    id="clientPaymentConditions"
                    label={intl.formatMessage({ id: 'clientPaymentConditions' })}
                    type="text"
                    error={error.clientPaymentConditions}
                    helperText={error.clientPaymentConditions}
                    fullWidth
                    onChange={(e) => setClientPaymentConditions(e.target.value)}
                />
                <TextField id="operatingCurrency"
                    value={operatingCurrency}
                    disabled={mode!=='EDIT'}
                    margin="none"
                    label={intl.formatMessage({ id: 'operatingCurrency' })}
                    onChange={(e) => setOperatingCurrency(e.target.value)}
                    error={error.operatingCurrency}
                    helperText={error.operatingCurrency}
                    select>
                    <MenuItem value="EU">EU</MenuItem>
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="UKP">UKP</MenuItem>
                </TextField>
                <TextField
                    value={roundingRules}
                    disabled={mode!=='EDIT'}
                    margin="none"
                    id="roundingRules"
                    label={intl.formatMessage({ id: 'roundingRules' })}
                    type="text"
                    error={error.roundingRules}
                    helperText={error.roundingRules}
                    fullWidth
                    onChange={(e) => setRoundingRules(e.target.value)}
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
                    {intl.formatMessage({ id: 'selectImageBrandWizard' })}
                </Typography>
                <CardMedia
                className={classes.media}
                image={image && image.source ? image.source : props.brand.image ? props.brand.image : placeHolderImage}
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
                    {intl.formatMessage({ id: 'selectNameBrandWizard' })}
                </Typography>
                <TextField
                    value={brandName}
                    autoFocus
                    margin="none"
                    id="brandName"
                    label={intl.formatMessage({ id: 'brandName' })}
                    type="text"
                    error={error.brandName}
                    helperText={error.brandName}
                    fullWidth
                    onChange={(e) => setBrandName(e.target.value)}
                />
                <Grid item direction="row" justify="space-between">
                    <p><button onClick={()=>wizardInstance.previousStep()} className={classes.backButton}><FaArrowLeft/></button></p>
                </Grid>
                <Grid item direction="row" justify="space-between">
                    <p><button disabled={!brandName} onClick={()=>wizardInstance.nextStep()} className={classes.nextButton}><FaArrowRight/></button></p>
                </Grid>

                </Grid>
            </div>
            <div>
            <Grid item container direction="row" justify="flex-start">
                <TextField
                    value={siret}
                    margin="none"
                    id="siret"
                    label={intl.formatMessage({ id: 'siret' })}
                    type="text"
                    error={error.siret}
                    helperText={error.siret}
                    fullWidth
                    onChange={(e) => setSiret(e.target.value)}
                />
                <Grid item direction="row" justify="space-between">
                    <p><button onClick={()=>wizardInstance.previousStep()} className={classes.backButton}><FaArrowLeft/></button></p>
                </Grid>
                <Grid item direction="row" justify="space-between">
                    <p><button onClick={()=>wizardInstance.nextStep()} className={classes.nextButton}><FaArrowRight/></button></p>
                </Grid>
            </Grid>
            </div>
            <div>
            <Grid item container direction="row" justify="flex-start">
                <TextField
                    value={addressLine1}
                    margin="none"
                    margin="addressLine1"
                    id="addressLine1"
                    label={intl.formatMessage({ id: 'addressLine1' })}
                    type="text"
                    error={error.addressLine1}
                    helperText={error.addressLine1}
                    fullWidth
                    onChange={(e) => setAddressLine1(e.target.value)}
                />
                <Grid item direction="row" justify="space-between">
                    <p><button onClick={()=>wizardInstance.previousStep()} className={classes.backButton}><FaArrowLeft/></button></p>
                </Grid>
                <Grid item direction="row" justify="space-between">
                    <p><button onClick={()=>wizardInstance.nextStep()} className={classes.nextButton}><FaArrowRight/></button></p>
                </Grid>
            </Grid>
            </div>
            <div>
            <Grid item container direction="row" justify="flex-start">
                <TextField
                    value={addressLine2}
                    margin="none"
                    id="addressLine2"
                    label={intl.formatMessage({ id: 'addressLine2' })}
                    type="text"
                    error={error.addressLine2}
                    helperText={error.addressLine2}
                    fullWidth
                    onChange={(e) => setAddressLine2(e.target.value)}
                />
                <Grid item direction="row" justify="space-between">
                    <p><button onClick={()=>wizardInstance.previousStep()} className={classes.backButton}><FaArrowLeft/></button></p>
                </Grid>
                <Grid item direction="row" justify="space-between">
                    <p><button onClick={()=>wizardInstance.nextStep()} className={classes.nextButton}><FaArrowRight/></button></p>
                </Grid>
            </Grid>
            </div>
            <div>
            <Grid item container direction="row" justify="flex-start">
                <TextField
                    value={postalCode}
                    margin="none"
                    id="postalCode"
                    label={intl.formatMessage({ id: 'postalCode' })}
                    type="text"
                    error={error.postalCode}
                    helperText={error.postalCode}
                    fullWidth
                    onChange={(e) => setPostalCode(e.target.value)}
                />
                <Grid item direction="row" justify="space-between">
                    <p><button onClick={()=>wizardInstance.previousStep()} className={classes.backButton}><FaArrowLeft/></button></p>
                </Grid>
                <Grid item direction="row" justify="space-between">
                    <p><button onClick={()=>wizardInstance.nextStep()} className={classes.nextButton}><FaArrowRight/></button></p>
                </Grid>
            </Grid>
            </div>
            <div>
            <Grid item container direction="row" justify="flex-start">
                <TextField
                    value={clientPaymentConditions}
                    margin="none"
                    id="clientPaymentConditions"
                    label={intl.formatMessage({ id: 'clientPaymentConditions' })}
                    type="text"
                    error={error.clientPaymentConditions}
                    helperText={error.clientPaymentConditions}
                    fullWidth
                    onChange={(e) => setClientPaymentConditions(e.target.value)}
                />
                <Grid item direction="row" justify="space-between">
                    <p><button onClick={()=>wizardInstance.previousStep()} className={classes.backButton}><FaArrowLeft/></button></p>
                </Grid>
                <Grid item direction="row" justify="space-between">
                    <p><button onClick={()=>wizardInstance.nextStep()} className={classes.nextButton}><FaArrowRight/></button></p>
                </Grid>
            </Grid>
            </div>
            <div>
                <TextField id="operatingCurrency"
                    value={operatingCurrency}
                    margin="none"
                    label={intl.formatMessage({ id: 'operatingCurrency' })}
                    onChange={(e) => setOperatingCurrency(e.target.value)}
                    error={error.operatingCurrency}
                    helperText={error.operatingCurrency}
                    select>
                    <MenuItem value="EU">EU</MenuItem>
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="UKP">UKP</MenuItem>
                </TextField>
                <Grid container>
                <Grid item direction="row" justify="space-between">
                    <p><button onClick={()=>wizardInstance.previousStep()} className={classes.backButton}><FaArrowLeft/></button></p>
                </Grid>
                <Grid item direction="row" justify="space-between">
                    <p><button onClick={()=>wizardInstance.nextStep()} className={classes.nextButton}><FaArrowRight/></button></p>
                </Grid>
                </Grid>
            </div>
            <div>
                <TextField
                    value={roundingRules}
                    margin="none"
                    id="roundingRules"
                    label={intl.formatMessage({ id: 'roundingRules' })}
                    type="text"
                    error={error.roundingRules}
                    helperText={error.roundingRules}
                    fullWidth
                    onChange={(e) => setRoundingRules(e.target.value)}
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
    if (props.displayMode === 'detail') {
        return (
            detailedView
        );
    } else {
        return (
            <>
                <GenericListView
                    image={image && image.source ? image.source : props.brand.image ? props.brand.image : placeHolderImage}
                    title={brandName}
                    onClick={()=>{
                        history.push('/collections/'+props.brand.id)
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