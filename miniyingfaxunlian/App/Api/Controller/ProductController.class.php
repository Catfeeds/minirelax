<?php
// 本类由系统自动生成，仅供测试用途
namespace Api\Controller;
use Think\Controller;
class ProductController extends PublicController {
	//***************************
	//  获取商品详情信息接口
	//***************************
    public function index(){
		$product=M("product");

		$pro_id = intval($_REQUEST['pro_id']);
		$pro = $product->where('id='.intval($pro_id).' AND del=0')->find();
		if(!$pro){
			echo json_encode(array('status'=>0,'err'=>'节目信息异常！'.__LINE__));
			exit();
		}

		$pro['photo_x'] =__DATAURL__.$pro['photo_x'];
		$pro['papers'] =__DATAURL__.$pro['papers'];
		$pro['avatar'] =__PUBLICURL__."home/images/avatar.png";

		$content = str_replace('/miniread/Data/', __DATAURL__, $pro['content']);
		$pro['content']=html_entity_decode($content, ENT_QUOTES , 'utf-8');

		$userinfo = M('user')->where('id='.intval($_REQUEST['uid']))->find();
		if (intval($userinfo['del'])==1) {
			echo json_encode(array('status'=>0,'err'=>'账号状态异常！'));
			exit();
		}
		$userType = intval($userinfo['type']);
		if (intval($userinfo['type'])>1 && intval($userinfo['offtime'])<time()) {
			M('user')->where('id='.intval($_REQUEST['uid']))->save(array('type'=>1,'offtime'=>0));
			$userType = 1;
		}

		$intro = M('web')->where('id=3')->getField('concent');
		$intross = str_replace('/miniread/Data/', __DATAURL__, $intro);
		$intro = html_entity_decode($intross, ENT_QUOTES , 'utf-8');

		echo json_encode(array('status'=>1,'pro'=>$pro,'intro'=>$intro,'is_open'=>1,'userType'=>$userType));
		exit();

	}

	//***************************
	//  获取商品详情接口
	//***************************
	public function details(){
		header('Content-type:text/html; Charset=utf8');
		$pro_id = intval($_REQUEST['pro_id']);
		$pro = M('product')->where('id='.intval($pro_id).' AND del=0')->find();
		if(!$pro){
			echo json_encode(array('status'=>0,'err'=>'商品不存在或已下架！'));
			exit();
		}
		$content = str_replace('/minihy/Data/', __DATAURL__, $pro['content']);
		$content = htmlspecialchars_decode($content);
		echo json_encode(array('status'=>1,'content'=>$content));
		exit();
	}

	//***************************
	//  获取商品列表接口
	//***************************
   	public function lists(){
 		$json="";
 		$id=intval($_REQUEST['cat_id']);//获得分类id 这里的id是pro表里的cid

 		$keyword=trim($_REQUEST['keyword']);
 		//排序
 		$order="addtime desc";//默认按添加时间排序

 		//条件
 		$where="1=1 AND del=0";
 		if(intval($id)){
 			$where.=" AND cid=".intval($id);
 		}

 		if($keyword && $keyword!='undefined') {
            $where.=' AND name LIKE "%'.$keyword.'%"';
        }

 		$product=M('product')->where($where)->order($order)->limit(8)->select();
 		//echo M('product')->_sql();exit;
 		$json = array();$json_arr = array();
 		foreach ($product as $k => $v) {
 			$json['id']=$v['id'];
 			$json['name']=$v['name'];
 			$json['photo_x']=__DATAURL__.$v['photo_x'];
 			$json['sname']=M('shangchang')->where('id='.intval($v['shop_id']))->getField('name');
 			$json_arr[] = $json;
 		}
 		$cat_name=M('pro_cat')->where("id=".intval($id))->getField('name');
 		echo json_encode(array('status'=>1,'pro'=>$json_arr,'cat_name'=>$cat_name));
 		exit();
    }

    //*******************************
	//  商品列表页面 获取更多接口
	//*******************************
    public function get_more(){
 		$json="";
 		$id=intval($_POST['cat_id']);//获得分类id 这里的id是pro表里的cid

 		$page= intval($_POST['page']);
 		if (!$page) {
 			$page=2;
 		}
 		$limit = intval($page*8)-8;

 		$keyword=I('post.keyword');
 		//排序
 		$order="addtime desc";//默认按添加时间排序
 		//条件
 		$where="1=1 AND del=0";
 		if(intval($id)){
 			$where.=" AND cid=".intval($id);
 		}

 		if($keyword && $keyword!='undefined') {
            $where.=' AND name LIKE "%'.$keyword.'%"';
        }

 		$product=M('product')->where($where)->order($order)->limit($limit.',8')->select();
 		//echo M('product')->_sql();exit;
 		$json = array();$json_arr = array();
 		foreach ($product as $k => $v) {
 			$json['id']=$v['id'];
 			$json['name']=$v['name'];
 			$json['photo_x']=__DATAURL__.$v['photo_x'];
 			$json['sname']=M('shangchang')->where('id='.intval($v['shop_id']))->getField('name');
 			$json_arr[] = $json;
 		}
 		$cat_name=M('pro_cat')->where("id=".intval($id))->getField('name');
 		echo json_encode(array('pro'=>$json_arr,'cat_name'=>$cat_name));
 		exit();
    }

}