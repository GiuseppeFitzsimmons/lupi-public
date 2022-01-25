import { useDispatch, useSelector } from 'react-redux';
import {
    loadBrandsAsync
    } from '../../features/brandSlice'


export default function CurrentBrandHeader(props) {
    const dispatch = useDispatch();
    const currentBrandId = localStorage.getItem('currentBrand');
    const theBrand = useSelector(state=>{
        console.log("CurrentBrandHeader", state.brand)
        if (currentBrandId) {
            return state?.brand?.brands?.find(b=>b.id===currentBrandId)
        }
        
    });
    if (!theBrand) {
        dispatch(loadBrandsAsync());
    }
    
return (
        <div style={{marginLeft:'0px', width:'100%', background:'black', marginBottom:'10px', color:'white', padding:'2px'}}>
        {theBrand &&
            <img src={theBrand.image} style={{height:'14px', background:'white', marginRight:'2px'}}/>
        }
        {theBrand ? theBrand.brandName : ''}
        </div>
    )
}