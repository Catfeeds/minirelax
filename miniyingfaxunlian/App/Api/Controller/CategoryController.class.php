<?php
// 本类由系统自动生成，仅供测试用途
namespace Api\Controller;
use Think\Controller;
class CategoryController extends PublicController {
	//***************************
	// 产品分类
	//***************************
    public function index(){
    	$list = M('category')->where('tid=1')->field('id,tid,name')->select();
        $catList = M('category')->where('tid='.intval($list[0]['id']))->field('id,name,bz_1')->select();
        foreach ($catList as $k => $v) {
            $catList[$k]['bz_1'] = __DATAURL__.$v['bz_1'];
        }

    	//json加密输出
		//dump($json);
		echo json_encode(array('status'=>1,'list'=>$list,'catList'=>$catList));
        exit();
    }

    //***************************
    // 获取二级 分类
    //***************************
    public function getcat(){
        $catid = intval($_REQUEST['tid']);
        if (!$catid) {
            echo json_encode(array('status'=>0,'err'=>'数据异常！'));
            exit();
        }

        $list = M('pro_cat')->where('del=0 AND tid='.intval($catid))->order('sort asc,addtime desc')->select();
        foreach ($list as $k => $v) {
            $list[$k]['img'] = __DATAURL__.$v['img'];
            $list[$k]['tcat'] = intval(M('pro_cat')->where('del=0 AND tid='.intval($v['id']))->getField('COUNT(id)'));
        }

        echo json_encode(array('status'=>1,'list'=>$list));
        exit();
    }

}