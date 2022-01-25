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
import { FaWindowClose, FaExpandAlt, FaEdit, FaLock } from 'react-icons/fa';
import {
  cancelCreateCollection, saveCollectionAsync
  } from '../../features/collectionSlice'
import { MenuItem } from '@material-ui/core';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { allowedScope } from '../utility/token-utility';
import GenericListView from './GenericListView';
import Dialog from '@material-ui/core/Dialog';
import { Link, useLocation, useHistory } from 'react-router-dom';

const useStyles = makeStyles({
    root: {
        maxWidth: 245,
        margin:6,
        fontSize:'1em',
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
        top:'0',
        left:'0',
        height:'100%'
      }
});

export default function CollectionView(props) {
    const history = useHistory();
    const classes = useStyles();
    const intl = useIntl();
    const dispatch = useDispatch();
    const [collectionName, setCollectionName] = useState(props.collection.collectionName);
    const [deliveryDate, setDeliveryDate] = useState(props.collection.deliveryDate);
    const [markup, setMarkup] = useState(props.collection.markup);
    const error=useSelector(state => {
        //TODO this specific collection
        return {}
    })
    const loading=useSelector(state=>{
        if (state?.collection?.status?.id===props?.collection?.id) {
            return state?.collection?.status?.status==='loading'
        }
    })
    const handleSave = () => {
        dispatch(saveCollectionAsync({id:props.collection.id, collectionName, deliveryDate, markup, brandId: props.collection.brandId}))
    }
    const handleCancel = () => {
        dispatch(cancelCreateCollection({collection:props.collection}));
    }
    const [mode, setMode] = useState(props.collection.collectionName ? 'DISPLAY':'EDIT');
    const canEdit=allowedScope(props.collection.brandId, 'collection:edit');
    const [editorDialogue, showEditorDialogue] = useState(false);
    const placeHolderImage = "/default-avatar.png";
    const brand=useSelector(state=>{
        return state?.brand?.brands?.find(brand=>brand.id===props.collection.brandId);
    })
    //console.log("COLLECTION VIEW", props.collection)
    const [isDirty, setDirty] = useState(false);
    useEffect(()=>{
        let dirty=collectionName!==props.collection.collectionName ||
        deliveryDate!==props.collection.deliveryDate ||
        markup!==props.collection.markup
        setDirty(dirty);
    })

    const detailedView = <Card className={classes.root} m={18}>
    <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
    </Backdrop>
        <CardActionArea>
            <CardContent>
                <TextField
                    value={collectionName}
                    autoFocus
                    disabled={mode!=='EDIT'}
                    margin="none"
                    id="collectionName"
                    label={intl.formatMessage({ id: 'collectionName' })}
                    type="text"
                    error={error.collectionName}
                    helperText={error.collectionName}
                    fullWidth
                    onChange={(e)=>setCollectionName(e.target.value)}
                />
                <TextField
                    value={deliveryDate}
                    disabled={mode!=='EDIT'}
                    margin="none"
                    id="deliveryDate"
                    label={intl.formatMessage({ id: 'deliveryDate' })}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    type="date"
                    error={error.deliveryDate}
                    helperText={error.deliveryDate}
                    fullWidth
                    onChange={(e)=>setDeliveryDate(e.target.value)}
                />
                <TextField
                    value={markup}
                    disabled={mode!=='EDIT'}
                    margin="none"
                    id="markup"
                    label={intl.formatMessage({ id: 'markup' })}
                    type="text"
                    error={error.markup}
                    helperText={error.markup}
                    fullWidth
                    onChange={(e)=>setMarkup(e.target.value)}
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

    const summaryView=<>
        <GenericListView
            image={brand && brand.image ? brand.image : placeHolderImage}
            colour='purple'
            title={collectionName}
            onClick={()=>{
                history.push('/products/'+brand.id+'/products/'+props.collection.id)
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
            <FaWindowClose onClick={() => showEditorDialogue(false)} style={{ position: 'absolute', zIndex: 99 }} />
            <div style={{ overflowY: 'scroll' }}>
                {detailedView}
            </div>
        </Dialog>
    </>
    if (props.displayMode === 'detail') {
        return (
            detailedView
        );
    } else {
        return (
            summaryView
        )
    }
}